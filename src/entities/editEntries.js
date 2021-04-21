import update from '#rsu/immutable-update';
import {
    isNotDefined,
    isDefined,
    listToMap,
    listToGroupList,
    randomString,
    compareDate,
    compareNumber,
    isFalsy,
    isTruthy,
} from '@togglecorp/fujs';
import {
    pick,
} from '#utils/common';

const getLocalData = (item = {}) => item.localData;
const getData = (item = {}) => item.data;
const getServerData = (item = {}) => item.serverData;

const getLocalDataSafe = item => getLocalData(item) || {};
const getDataSafe = item => getData(item) || {};
const getServerDataSafe = item => getServerData(item) || {};

export const entryAccessor = {
    localData: getLocalData,
    data: getData,
    serverData: getServerData,

    key: entry => getLocalDataSafe(entry).id,
    error: entry => getLocalDataSafe(entry).error,
    color: entry => getLocalDataSafe(entry).color,
    isMarkedAsDeleted: entry => getLocalDataSafe(entry).isMarkedAsDeleted,
    isPristine: entry => getLocalDataSafe(entry).isPristine,
    hasError: entry => getLocalDataSafe(entry).hasError,
    hasServerError: entry => getLocalDataSafe(entry).hasServerError,

    dataAttributes: entry => getDataSafe(entry).attributes,
    dataAttribute: (entry, attributeId) => (
        ((getDataSafe(entry).attributes || {})[attributeId] || {}).data
    ),
    entryType: entry => getDataSafe(entry).entryType,
    excerpt: entry => getDataSafe(entry).excerpt,
    droppedExcerpt: entry => getDataSafe(entry).droppedExcerpt,
    isHighlightHidden: entry => getDataSafe(entry).highlightHidden,
    tabularField: entry => getDataSafe(entry).tabularField,
    order: entry => getDataSafe(entry).order,
    serverId: entry => getDataSafe(entry).id,
    createdBy: entry => getDataSafe(entry).createdBy,

    unresolvedCommentCount: entry => getServerDataSafe(entry).unresolvedCommentCount || 0,
    controlled: entry => getServerDataSafe(entry).controlled || false,
    versionId: entry => getServerDataSafe(entry).versionId,
    imageDetails: entry => getServerDataSafe(entry).imageDetails,
};

export const entryGroupAccessor = {
    localData: getLocalData,
    data: getData,
    serverData: getServerData,

    key: entryGroup => getLocalDataSafe(entryGroup).id,
    error: entryGroup => getLocalDataSafe(entryGroup).error,
    isMarkedAsDeleted: entryGroup => getLocalDataSafe(entryGroup).isMarkedAsDeleted,
    isPristine: entryGroup => getLocalDataSafe(entryGroup).isPristine,
    hasError: entryGroup => getLocalDataSafe(entryGroup).hasError,
    hasServerError: entryGroup => getLocalDataSafe(entryGroup).hasServerError,
    selections: entryGroup => getDataSafe(entryGroup).selections,

    order: entryGroup => getDataSafe(entryGroup).order,
    serverId: entryGroup => getDataSafe(entryGroup).id,

    versionId: entryGroup => getServerDataSafe(entryGroup).versionId,
};

export const getEntryGroupsForEntry = (entryGroups, entryClientId, labels) => {
    const selections = entryGroups.map((entryGroup) => {
        const entryGroupData = entryGroupAccessor.data(entryGroup);
        const entryGroupSelections = entryGroupAccessor.selections(entryGroup);

        if (!entryGroupSelections) {
            return [];
        }

        return entryGroupSelections
            .filter(g => g.entryClientId === entryClientId)
            .map(g => ({
                ...g,
                title: entryGroupData.title,
            }));
    }).flat();

    const selectionsByLabel = listToGroupList(selections, d => d.labelId);

    const labelsWithGroups = labels.map((label) => {
        const currentSelections = selectionsByLabel[label.id];

        if (isNotDefined(currentSelections)) {
            return undefined;
        }

        const groups = currentSelections.map(g => g.title);
        const count = groups.length;

        return ({
            labelId: label.id,
            labelColor: label.color,
            labelTitle: label.title,
            groups,
            count,
        });
    }).filter(isDefined);

    return labelsWithGroups;
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

const calculateState = ({ item, restPending, accessor }) => {
    const serverId = accessor.serverId(item);
    const pristine = accessor.isPristine(item);
    const hasLocalError = accessor.hasError(item);
    const hasServerError = accessor.hasServerError(item);

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

export const calculateEntryState = ({ entry, restPending }) => (
    calculateState({ item: entry, restPending, accessor: entryAccessor })
);

export const calculateEntryGroupState = ({ entryGroup, restPending }) => (
    calculateState({ item: entryGroup, restPending, accessor: entryGroupAccessor })
);

export const createEntry = ({
    key,
    serverId,
    versionId,
    verified,
    data = {},
    isPristine = false,
    hasError = false,
    color,
}) => {
    const {
        imageDetails,
    } = data;

    const keysToPick = [
        'excerpt',
        'image',
        'imageRaw',
        'leadImage',
        'tabularField',
        'entryType',
        'lead',
        'order',

        'highlightHidden',
        'droppedExcerpt',

        'analysisFramework',
        'attributes',
        'exportData',
        'filterData',
        'createdAt',
        'createdBy',
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
            verified: false,
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
            color: { $set: color },
            error: { $set: undefined },
        },
        serverData: {
            versionId: { $set: versionId },
            verified: { $set: verified },
            imageDetails: { $set: imageDetails },
        },
        data: {
            $set: { id: serverId, ...pickedData },
        },
    };

    return update(entrySkeleton, settings);
};

export const createEntryGroup = ({
    key,
    serverId,
    versionId,
    data = {},
    isPristine = false,
    hasError = false,
}) => {
    const keysToPick = [
        'order',
        'title',
        'selections',
        'createdAt',
    ];
    const pickedData = pick(data, keysToPick);

    const entrySkeleton = {
        localData: {
            id: undefined,
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

export const DIFF_ACTION = {
    // do nothing to the local state
    noop: 'noop',
    // add it to list of item in local state
    add: 'add',
    // remote it from the list of item in local state
    remove: 'remove',
    // update it to the list of item in local state
    replace: 'replace',
};

export const createDiff = (locals, remotes, accessor = entryAccessor, create = createEntry) => {
    // accumulate action 'add'
    const localItemsMapByServerId = listToMap(
        locals,
        accessor.serverId,
        (item, key) => (key ? true : undefined),
    );
    const localItemsMapByKey = listToMap(
        locals,
        accessor.key,
        (item, key) => (key ? true : undefined),
    );

    const actionsFoo = remotes.reduce(
        (acc, remoteItem) => {
            const {
                id: remoteServerId,
                versionId: remoteVersionId,
                verified: remoteVerified,
                clientId: remoteKey,
            } = remoteItem;

            // NOTE: there may not be a clientId

            // Try to find localItem first be serverId then by clientId
            // NOTE: Sometimes, a item is saved in server but the serverId
            // hasn't been updated locally because of network error (or some exception in code)
            // which can result in duplicated items locally
            const localItem = localItemsMapByServerId[remoteServerId]
                || (remoteKey ? localItemsMapByKey[remoteKey] : undefined);

            if (!localItem) {
                // NOTE: New remote item has been added
                const localId = remoteKey || randomString(16);
                const newItem = create({
                    key: localId,
                    serverId: remoteServerId,
                    versionId: remoteVersionId,
                    verified: remoteVerified,
                    data: remoteItem,
                    isPristine: true,
                    hasError: false,
                });
                acc.push({
                    serverId: remoteServerId,
                    action: DIFF_ACTION.add,
                    item: newItem,
                });
            }
            return acc;
        },
        [],
    );

    // Accumulate other actions
    const remoteItemsMapByServerId = listToMap(remotes, remoteItem => remoteItem.id);
    const remoteItemsMapByClientId = listToMap(remotes, remoteItem => remoteItem.clientId);

    const actionsBar = locals.reduce(
        (arr, localItem) => {
            const localId = accessor.key(localItem);
            const localServerId = accessor.serverId(localItem);
            const localVersionId = accessor.versionId(localItem);

            const remoteItem = remoteItemsMapByServerId[localServerId]
                || remoteItemsMapByClientId[localId];

            if (
                remoteItem && (
                    isFalsy(localVersionId) || localVersionId < remoteItem.versionId
                )
            ) {
                // this item was updated on server
                const {
                    id: remoteServerId,
                    versionId: remoteVersionId,
                    verified: remoteVerified,
                } = remoteItem;
                const newItem = create({
                    key: localId,
                    serverId: remoteServerId, // here
                    versionId: remoteVersionId,
                    verified: remoteVerified,
                    data: remoteItem,
                    isPristine: true,
                    hasError: false,
                });

                const localPristine = accessor.isPristine(localItem);
                const localError = accessor.hasError(localItem);
                const localValues = accessor.data(localItem);
                const newItemOnSkip = create({
                    key: localId,
                    serverId: remoteServerId,
                    versionId: remoteVersionId,
                    verified: remoteVerified,
                    data: localValues,
                    isPristine: localPristine,
                    hasError: localError,
                });

                arr.push({
                    id: localId,
                    serverId: remoteServerId,
                    action: DIFF_ACTION.replace,
                    item: newItem,
                    itemOnSkip: newItemOnSkip,
                });
            } else if (!remoteItem && isTruthy(localServerId)) {
                // this item was removed from server
                arr.push({
                    id: localId,
                    serverId: localServerId,
                    action: DIFF_ACTION.remove,
                });
            } else {
                // this local item has not been saved
                // or the item has not changed in server
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

export const applyDiff = (localItems = [], diffs = [], accessor = entryAccessor) => (
    diffs
        .reduce(
            (acc, diff) => {
                const index = localItems.findIndex(e => accessor.key(e) === diff.id);
                switch (diff.action) {
                    case DIFF_ACTION.add: {
                        const remoteItem = diff.item;
                        if (!diff.skip) {
                            acc.push(remoteItem);
                        } // else don't push
                        break;
                    }
                    case DIFF_ACTION.remove:
                        if (diff.skip) {
                            acc.push(localItems[index]);
                        } // else skip adding to push
                        break;
                    case DIFF_ACTION.replace: {
                        if (!diff.skip) {
                            acc.push(diff.item);
                        } else {
                            acc.push(diff.itemOnSkip);
                        }
                        break;
                    }
                    case DIFF_ACTION.noop: {
                        // push as it is
                        acc.push(localItems[index]);
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
            const aValue = accessor.data(a);
            const aOrder = aValue.order;
            const aCreatedAt = aValue.createdAt;

            const bValue = accessor.data(b);
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
