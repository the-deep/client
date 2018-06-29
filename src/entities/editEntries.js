import update from '#rs/utils/immutable-update';
import {
    listToMap,
    randomString,
    compareDate,
    compareNumber,
} from '#rs/utils/common';
import {
    pick,
} from '#utils/common';

export const ENTRY_STATUS = {
    // A rest request is in session
    requesting: 'requesting',
    // Error occured and it cannot be recovered
    invalid: 'invalid',
    // Some changed has occured
    nonPristine: 'nonPristine',
    // No change has occured and saved in server
    complete: 'complete',
    // Some change has occured
    pristine: 'pristine',
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

export const entryAccessor = {
    localData: (entry = {}) => entry.localData,
    data: (entry = {}) => entry.data,
    serverData: (entry = {}) => entry.serverData,

    key: (entry = {}) => (entry.localData || {}).id,
    error: (entry = {}) => (entry.localData || {}).error,
    isMarkedAsDeleted: (entry = {}) => (entry.localData || {}).isMarkedAsDeleted,

    order: (entry = {}) => (entry.data || {}).order,
    serverId: (entry = {}) => (entry.data || {}).id,

    versionId: (entry = {}) => (entry.serverData || {}).versionId,
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
    const localEntriesMap = listToMap(
        locals,
        entryAccessor.serverId,
        (entry, key) => (key ? true : undefined),
    );
    const actionsFoo = remotes.reduce(
        (acc, remoteEntry) => {
            const {
                id: remoteServerId,
                versionId: remoteVersionId,
            } = remoteEntry;

            const localEntry = localEntriesMap[remoteServerId];
            if (!localEntry) {
                // NOTE: New remote entry has been added
                const localId = randomString();
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
    const remoteEntriesMap = listToMap(remotes, remoteEntry => remoteEntry.id);
    const actionsBar = locals.reduce(
        (arr, localEntry) => {
            const localId = entryAccessor.key(localEntry);
            const localServerId = entryAccessor.serverId(localEntry);
            const localVersionId = entryAccessor.versionId(localEntry);

            // get remote enty with same serverId as current local entry
            const remoteEntry = remoteEntriesMap[localServerId];
            if (!localServerId) {
                // this local entry hasn't been saved
                arr.push({
                    id: localId,
                    action: DIFF_ACTION.noop,
                });
            } else if (!remoteEntry) {
                // this entry was removed from server
                arr.push({
                    id: localId,
                    serverId: localServerId,
                    action: DIFF_ACTION.remove,
                });
            } else if (localVersionId < remoteEntry.versionId) {
                // this entry was updated on server
                const { versionId: remoteVersionId } = remoteEntry;
                const newEntry = createEntry({
                    id: localId,
                    serverId: localServerId, // here
                    versionId: remoteVersionId,
                    data: remoteEntry,
                    isPristine: true,
                    hasError: false,
                });

                const localPristine = entryAccessor.isPristine(localEntry);
                const localError = entryAccessor.hasError(localEntry);
                const localValues = entryAccessor.data(localEntry);
                const newEntryOnSkip = createEntry({
                    id: localId,
                    serverId: localServerId,
                    versionId: remoteVersionId,
                    data: localValues,
                    isPristine: localPristine,
                    hasError: localError,
                });

                arr.push({
                    id: localId,
                    serverId: localServerId,
                    action: DIFF_ACTION.replace,
                    entry: newEntry,
                    entryOnSkip: newEntryOnSkip,
                });
            } else {
                // the entry wasn't changed on server
                arr.push({
                    id: localId,
                    serverId: localServerId,
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
