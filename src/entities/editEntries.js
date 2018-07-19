import update from '#rs/utils/immutable-update';
import {
    listToMap,
    randomString,
    compareDate,
    compareNumber,
    isFalsy,
    isTruthy,
} from '#rs/utils/common';
import {
    pick,
} from '#utils/common';

export const entryAccessor = {
    localData: (entry = {}) => entry.localData,
    data: (entry = {}) => entry.data,
    serverData: (entry = {}) => entry.serverData,

    key: (entry = {}) => (entry.localData || {}).id,
    error: (entry = {}) => (entry.localData || {}).error,
    isMarkedAsDeleted: (entry = {}) => !!(entry.localData || {}).isMarkedAsDeleted,
    isPristine: (entry = {}) => !!(entry.localData || {}).isPristine,
    hasError: (entry = {}) => !!(entry.localData || {}).hasError,
    hasServerError: (entry = {}) => !!(entry.localData || {}).hasServerError,

    dataAttributes: (entry = {}) => (entry.data || {}).attributes,
    dataAttribute: (entry = {}, attributeId) => (
        (((entry.data || {}).attributes || {})[attributeId] || {}).data
    ),
    order: (entry = {}) => (entry.data || {}).order,
    serverId: (entry = {}) => (entry.data || {}).id,

    versionId: (entry = {}) => (entry.serverData || {}).versionId,
};

export const ENTRY_STATUS = {
    // A rest request is in session
    requesting: 'requesting',
    // Error occured and it cannot be recovered
    localError: 'localError',
    // Error occured and it cannot be recovered
    serverError: 'serverError',
    // No change has occured and saved in server
    complete: 'complete',
    // No change has occured, and not saved in server
    pristine: 'pristine',
    // Some changed has occured
    nonPristine: 'nonPristine',
};

export const calculateEntryState = ({ entry, restPending }) => {
    const serverId = entryAccessor.serverId(entry);
    const pristine = entryAccessor.isPristine(entry);
    const hasLocalError = entryAccessor.hasError(entry);
    const hasServerError = entryAccessor.hasServerError(entry);

    if (restPending) {
        return ENTRY_STATUS.requesting;
    } else if (hasServerError) {
        return ENTRY_STATUS.serverError;
    } else if (hasLocalError) {
        return ENTRY_STATUS.localError;
    } else if (!pristine) {
        return ENTRY_STATUS.nonPristine;
    } else if (serverId) {
        return ENTRY_STATUS.complete;
    }
    return ENTRY_STATUS.pristine;
};

export const DIFF_ACTION = {
    // do nothing to the local state
    noop: 'noop',
    // add it to list of entry in local state
    add: 'add',
    // remote it from the list of entry in local state
    remove: 'remove',
    // update it to the list of entry in local state
    replace: 'replace',
};

export const createEntry = ({
    key, serverId, versionId, data = {}, isPristine = false, hasError = false,
}) => {
    const keysToPick = [
        'excerpt',
        'image',
        'entryType',
        'lead',
        'order',

        'analysisFramework',
        'attributes',
        'exportData',
        'filterData',
        'createdAt',
    ];
    const pickedData = pick(data, keysToPick);

    const entrySkeleton = {
        localData: {
            id: undefined,
            color: undefined,
            isPristine: true,
            hasError: false,
            hasSeverError: false,
            error: undefined,
            isMarkedAsDeleted: false,
        },
        serverData: {
            versionId: undefined,
        },
        data: {
            id: undefined, // serverId
            order: 0,
        },
    };
    const settings = {
        localData: {
            id: { $set: key },
            isPristine: { $set: isPristine },
            hasError: { $set: hasError },
            color: { $set: undefined },
            error: { $set: undefined },
        },
        serverData: {
            versionId: { $set: versionId },
        },
        data: {
            $set: { id: serverId, ...pickedData },
        },
    };

    return update(entrySkeleton, settings);
};

export const createDiff = (locals, remotes) => {
    // accumulate action 'add'
    const localEntriesMapByServerId = listToMap(
        locals,
        entryAccessor.serverId,
        (entry, key) => (key ? true : undefined),
    );
    const localEntriesMapByKey = listToMap(
        locals,
        entryAccessor.key,
        (entry, key) => (key ? true : undefined),
    );

    const actionsFoo = remotes.reduce(
        (acc, remoteEntry) => {
            const {
                id: remoteServerId,
                versionId: remoteVersionId,
                clientId: remoteKey,
            } = remoteEntry;

            // NOTE: there may not be a clientId

            // Try to find localEntry first be serverId then by clientId
            // NOTE: Sometimes, a entry is saved in server but the serverId
            // hasn't been updated locally because of network error (or some exception in code)
            // which can result in duplicated entries locally
            const localEntry = localEntriesMapByServerId[remoteServerId]
                || (remoteKey ? localEntriesMapByKey[remoteKey] : undefined);

            if (!localEntry) {
                // NOTE: New remote entry has been added
                const localId = remoteKey || randomString();
                const newEntry = createEntry({
                    key: localId,
                    serverId: remoteServerId,
                    versionId: remoteVersionId,
                    data: remoteEntry,
                    isPristine: true,
                    hasError: false,
                });
                acc.push({
                    serverId: remoteServerId,
                    action: DIFF_ACTION.add,
                    entry: newEntry,
                });
            }
            return acc;
        },
        [],
    );

    // Accumulate other actions
    const remoteEntriesMapByServerId = listToMap(remotes, remoteEntry => remoteEntry.id);
    const remoteEntriesMapByClientId = listToMap(remotes, remoteEntry => remoteEntry.clientId);

    const actionsBar = locals.reduce(
        (arr, localEntry) => {
            const localId = entryAccessor.key(localEntry);
            const localServerId = entryAccessor.serverId(localEntry);
            const localVersionId = entryAccessor.versionId(localEntry);

            const remoteEntry = remoteEntriesMapByServerId[localServerId]
                || remoteEntriesMapByClientId[localId];

            if (
                remoteEntry && (
                    isFalsy(localVersionId) || localVersionId < remoteEntry.versionId
                )
            ) {
                // this entry was updated on server
                const { id: remoteServerId, versionId: remoteVersionId } = remoteEntry;
                const newEntry = createEntry({
                    key: localId,
                    serverId: remoteServerId, // here
                    versionId: remoteVersionId,
                    data: remoteEntry,
                    isPristine: true,
                    hasError: false,
                });

                const localPristine = entryAccessor.isPristine(localEntry);
                const localError = entryAccessor.hasError(localEntry);
                const localValues = entryAccessor.data(localEntry);
                const newEntryOnSkip = createEntry({
                    key: localId,
                    serverId: remoteServerId,
                    versionId: remoteVersionId,
                    data: localValues,
                    isPristine: localPristine,
                    hasError: localError,
                });

                arr.push({
                    id: localId,
                    serverId: remoteServerId,
                    action: DIFF_ACTION.replace,
                    entry: newEntry,
                    entryOnSkip: newEntryOnSkip,
                });
            } else if (!remoteEntry && isTruthy(localServerId)) {
                // this entry was removed from server
                arr.push({
                    id: localId,
                    serverId: localServerId,
                    action: DIFF_ACTION.remove,
                });
            } else {
                // this local entry has not been saved
                // or the entry has not changed in server
                arr.push({
                    id: localId,
                    action: DIFF_ACTION.noop,
                });
            }
            return arr;
        },
        [],
    );

    return [...actionsFoo, ...actionsBar];
};

export const applyDiff = (localEntries = [], diffs = []) => (
    diffs
        .reduce(
            (acc, diff) => {
                const index = localEntries.findIndex(e => entryAccessor.key(e) === diff.id);
                switch (diff.action) {
                    case DIFF_ACTION.add: {
                        const remoteEntry = diff.entry;
                        if (!diff.skip) {
                            acc.push(remoteEntry);
                        } // else don't push
                        break;
                    }
                    case DIFF_ACTION.remove:
                        if (diff.skip) {
                            acc.push(localEntries[index]);
                        } // else skip adding to push
                        break;
                    case DIFF_ACTION.replace: {
                        if (!diff.skip) {
                            acc.push(diff.entry);
                        } else {
                            acc.push(diff.entryOnSkip);
                        }
                        break;
                    }
                    case DIFF_ACTION.noop: {
                        // push as it is
                        acc.push(localEntries[index]);
                        break;
                    }
                    default:
                        console.warn(`Error: action not valid ${diff.action}`);
                        break;
                }
                return acc;
            },
            [],
        )
        .sort((a, b) => {
            const aValue = entryAccessor.data(a);
            const aOrder = aValue.order;
            const aCreatedAt = aValue.createdAt;

            const bValue = entryAccessor.data(b);
            const bOrder = bValue.order;
            const bCreatedAt = bValue.createdAt;

            return compareNumber(aOrder, bOrder) || compareDate(aCreatedAt, bCreatedAt);
        })
);

export const getApplicableDiffs = diffs => diffs.filter(
    diff => diff.action !== DIFF_ACTION.noop && !diff.skip,
);

export const getApplicableAndModifyingDiffs = diffs => (
    getApplicableDiffs(diffs).filter(diff => diff.action !== DIFF_ACTION.add)
);

export const getApplicableDiffCount = diffs => (
    getApplicableDiffs(diffs).length
);

export const getApplicableAndModifyingDiffCount = diffs => (
    getApplicableAndModifyingDiffs(diffs).length
);
