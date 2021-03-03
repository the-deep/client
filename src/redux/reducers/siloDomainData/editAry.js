import { analyzeErrors } from '@togglecorp/faram';
import { isTruthy, listToMap } from '@togglecorp/fujs';
import produce from 'immer';

import update from '#rsu/immutable-update';

// FIXME: copy this to common place
const getNamespacedId = (leadId, leadGroupId) => {
    if (isTruthy(leadGroupId)) {
        return `lead-group-${leadGroupId}`;
    } else if (isTruthy(leadId)) {
        return `lead-${leadId}`;
    }
    return undefined;
};

// TYPE

export const EDIT_ARY__SET_ARY = 'siloDomainData/EDIT_ARY__SET_ARY';
export const EDIT_ARY__SAVE_ARY = 'siloDomainData/EDIT_ARY__SAVE_ARY';
export const EDIT_ARY__SET_FILES = 'siloDomainData/EDIT_ARY__SET_FILES';
export const EDIT_ARY__CHANGE_ARY = 'siloDomainData/EDIT_ARY__CHANGE_ARY';
export const EDIT_ARY__REMOVE_ARY = 'siloDomainData/EDIT_ARY__REMOVE_ARY';
export const EDIT_ARY__SET_ERROR_ARY = 'siloDomainData/EDIT_ARY__SET_ERROR_ARY';
export const EDIT_ARY__SET_ENTRIES = 'siloDomainData/EDIT_ARY__SET_ENTRIES';

// ACTION-CREATOR

export const setAryForEditAryAction = ({
    leadId,
    leadGroupId,

    serverId,
    versionId,
    metadata,
    methodology,
    summary,
    score,
    questionnaire,
}) => ({
    type: EDIT_ARY__SET_ARY,
    id: getNamespacedId(leadId, leadGroupId),
    serverId,
    versionId,
    metadata,
    methodology,
    summary,
    score,
    questionnaire,
});

// NOTE: flagged for removal, may not be used
export const saveAryForEditAryAction = ({ leadId, leadGroupId }) => ({
    type: EDIT_ARY__SAVE_ARY,
    id: getNamespacedId(leadId, leadGroupId),
});

export const setFilesForEditAryAction = ({ leadId, leadGroupId, files }) => ({
    type: EDIT_ARY__SET_FILES,
    id: getNamespacedId(leadId, leadGroupId),
    files,
});

export const changeAryForEditAryAction = ({
    leadId,
    leadGroupId,
    faramValues,
    faramErrors,
    isPristine,
}) => ({
    type: EDIT_ARY__CHANGE_ARY,
    id: getNamespacedId(leadId, leadGroupId),
    faramValues,
    faramErrors,
    isPristine,
});

export const removeAryForEditAryAction = ({
    leadId,
    leadGroupId,
}) => ({
    type: EDIT_ARY__REMOVE_ARY,
    id: getNamespacedId(leadId, leadGroupId),
});

export const setErrorAryForEditAryAction = ({
    leadId,
    leadGroupId,
    faramErrors,
}) => ({
    type: EDIT_ARY__SET_ERROR_ARY,
    id: getNamespacedId(leadId, leadGroupId),
    faramErrors,
});


export const setEntriesForEditAryAction = ({
    leadId,
    // leadGroupId,

    lead,
    entries,
}) => ({
    type: EDIT_ARY__SET_ENTRIES,
    id: getNamespacedId(leadId, undefined),

    lead,
    entries,
});

// REDUCER

const setAry = (state, action) => {
    const {
        id,

        serverId,
        versionId,
        metadata,
        methodology,
        summary,
        score,
        questionnaire,
    } = action;

    const settings = {
        editAry: {
            [id]: { $auto: {
                serverId: { $set: serverId },
                versionId: { $set: versionId },
                hasErrors: { $set: false },
                isPristine: { $set: true },
                faramErrors: { $set: { } },
                faramValues: { $set: {
                    metadata,
                    methodology,
                    summary,
                    score,
                    questionnaire,
                } },
            } },
        },
    };
    return update(state, settings);
};

const setFiles = (state, action) => {
    const {
        id,
        files,
    } = action;

    const settings = {
        editAry: {
            [id]: { $auto: {
                files: { $apply: (oldFiles) => {
                    const newFilesMap = listToMap(
                        files,
                        item => item.id,
                        item => item,
                    );
                    if (!oldFiles) {
                        return newFilesMap;
                    }
                    return {
                        ...oldFiles,
                        ...newFilesMap,
                    };
                } },
            } },
        },
    };
    return update(state, settings);
};

const changeAry = (state, action) => {
    const {
        id,
        faramValues,
        faramErrors,
        isPristine,
    } = action;

    const hasErrors = analyzeErrors(faramErrors);

    const settings = {
        editAry: {
            [id]: { $auto: {
                isPristine: { $set: isPristine },
                faramValues: { $set: faramValues },
                faramErrors: { $set: faramErrors },
                hasErrors: { $set: hasErrors },
            } },
        },
    };
    return update(state, settings);
};

const removeAry = (state, action) => {
    const {
        id,
    } = action;

    return produce(state, (safeState) => {
        const { editAry } = safeState;
        delete editAry[id];
    });
};

const setErrorAry = (state, action) => {
    const {
        id,
        faramErrors,
    } = action;

    const hasErrors = analyzeErrors(faramErrors);
    const settings = {
        editAry: {
            [id]: { $auto: {
                hasErrors: { $set: hasErrors },
                isPristine: { $set: false },
                faramErrors: { $set: faramErrors },
            } },
        },
    };
    return update(state, settings);
};

// FIXME: add new versionId and stuffs here
const saveAry = (state, action) => {
    const { id } = action;

    const settings = {
        editAry: {
            [id]: { $auto: {
                hasErrors: { $set: false },
                isPristine: { $set: true },
                faramErrors: { $set: {} },
            } },
        },
    };
    return update(state, settings);
};

const setEntries = (state, action) => {
    const { id, entries, lead } = action;
    const settings = {
        editAry: {
            [id]: { $auto: {
                lead: { $set: lead },
                entries: { $set: entries },
            } },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [EDIT_ARY__SET_ARY]: setAry,
    [EDIT_ARY__SET_ENTRIES]: setEntries,

    [EDIT_ARY__CHANGE_ARY]: changeAry,
    [EDIT_ARY__REMOVE_ARY]: removeAry,
    [EDIT_ARY__SET_ERROR_ARY]: setErrorAry,
    [EDIT_ARY__SAVE_ARY]: saveAry,
    [EDIT_ARY__SET_FILES]: setFiles,
};

export default reducers;
