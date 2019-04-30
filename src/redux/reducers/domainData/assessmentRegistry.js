import update from '#rsu/immutable-update';
import produce from 'immer';

// TYPE

export const ARY__SET_TEMPLATE = 'domainData/ARY__SET_TEMPLATE';
export const ARY__SET_ARY_FILTER_OPTIONS = 'domainData/ARY__SET_ARY_FILTER_OPTIONS';
export const ARY__SET_NEW_ORGANIZATION = 'domainData/ARY__SET_NEW_ORGANIZATION';

// ACTION-CREATOR

export const setAryTemplateAction = ({ template, projectId }) => ({
    type: ARY__SET_TEMPLATE,
    template,
    projectId,
});

export const setAryFilterOptionsAction = ({ projectId, aryFilterOptions }) => ({
    type: ARY__SET_ARY_FILTER_OPTIONS,
    projectId,
    aryFilterOptions,
});

export const setNewOrganizationAction = ({ projectId, organization }) => ({
    type: ARY__SET_NEW_ORGANIZATION,
    projectId,
    organization,
});

// HELPERS

// REDUCER

const setAryTemplate = (state, action) => {
    const { template, projectId } = action;
    const settings = {
        aryTemplates: {
            [projectId]: { $auto: {
                $set: template,
            } },
        },
    };
    return update(state, settings);
};

const setNewOrganization = (state, action) => {
    const { projectId, organization } = action;

    return produce(state, (safeState) => {
        if (!safeState.aryTemplates) {
            // eslint-disable-next-line no-param-reassign
            safeState.aryTemplates = {};
        }
        if (!safeState.aryTemplates[projectId]) {
            // eslint-disable-next-line no-param-reassign
            safeState.aryTemplates[projectId] = {};
        }
        if (!safeState.aryTemplates[projectId].sources) {
            // eslint-disable-next-line no-param-reassign
            safeState.aryTemplates[projectId].sources = {};
        }
        if (!safeState.aryTemplates[projectId].sources.organizations) {
            // eslint-disable-next-line no-param-reassign
            safeState.aryTemplates[projectId].sources.organizations = [];
        }
        // eslint-disable-next-line no-param-reassign
        safeState.aryTemplates[projectId].sources.organizations.push(organization);
    });
};

const setAryFilterOptions = (state, action) => {
    const { projectId, aryFilterOptions } = action;
    const settings = {
        aryFilterOptions: {
            [projectId]: { $auto: {
                $set: aryFilterOptions,
            } },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [ARY__SET_TEMPLATE]: setAryTemplate,
    [ARY__SET_ARY_FILTER_OPTIONS]: setAryFilterOptions,
    [ARY__SET_NEW_ORGANIZATION]: setNewOrganization,
};

export default reducers;
