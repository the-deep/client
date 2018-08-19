import update from '#rsu/immutable-update';

export const SET_PROJECT_DETAILS = 'siloDomainData/SET_PROJECT_DETAILS';
export const CHANGE_PROJECT_DETAILS = 'siloDomainData/CHANGE_PROJECT_DETAILS';
export const SET_ERROR_PROJECT_DETAILS = 'siloDomainData/SET_ERROR_PROJECT_DETAILS';

// REDUCER

export const setProjectDetailsAction = ({ project, projectId }) => ({
    type: SET_PROJECT_DETAILS,
    project,
    projectId,
});


export const changeProjectDetailsAction =
    ({ faramValues, faramErrors, projectId }) => ({
        type: CHANGE_PROJECT_DETAILS,
        faramValues,
        faramErrors,
        projectId,
    });


export const setErrorProjectDetailsAction =
    ({ faramErrors, projectId }) => ({
        type: SET_ERROR_PROJECT_DETAILS,
        faramErrors,
        projectId,
    });

export const setProjectDetails = (state, action) => {
    const {
        project,
        projectId,
    } = action;

    const {
        faramValues,
    } = project;

    const {
        title,
        description,
        startDate,
        endDate,
        role,
        versionId,
        regions,
        memberships,
        userGroups,
    } = faramValues;

    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                localData: { $auto: {
                    faramValues: { $set: {
                        title,
                        description,
                        startDate,
                        endDate,
                        role,
                        regions,
                        memberships,
                        userGroups,
                    } },
                    faramErrors: { $set: {} },
                    pristine: { $set: true },
                } },
                serverData: { $auto: {
                    versionId: { $set: versionId },
                } },
            } },
        } },
    };
    return update(state, settings);
};

export const changeProjectDetails = (state, action) => {
    const {
        faramValues,
        projectId,
    } = action;

    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                localData: { $auto: {
                    faramValues: { $set: faramValues },
                    pristine: { $set: false },
                } },
            } },
        } },
    };

    return update(state, settings);
};

export const setErrorProjectDetails = (state, action) => {
    const {
        faramErrors,
        projectId,
    } = action;

    const settings = {
        projectsView: { $auto: {
            [projectId]: { $auto: {
                localData: { $auto: {
                    faramErrors: { $set: faramErrors },
                    pristine: { $set: false },
                } },
            } },
        } },
    };
    return update(state, settings);
};

const reducers = {
    [SET_PROJECT_DETAILS]: setProjectDetails,
    [CHANGE_PROJECT_DETAILS]: changeProjectDetails,
    [SET_ERROR_PROJECT_DETAILS]: setErrorProjectDetails,
};

export default reducers;
