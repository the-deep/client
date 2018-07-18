import {
    GET,
    POST,
    commonHeaderForGetExternal,
    commonHeaderForPostExternal,
    p,
} from '#config/rest';

const getDeeplEndPoint = () => {
    switch (process.env.REACT_APP_DEEP_ENVIRONMENT) {
        case 'nightly':
            // TODO: create new endpoint
            return 'https://deepl-alpha.thedeep.io';
        case 'alpha':
            return 'https://deepl-alpha.thedeep.io';
        case 'beta':
            return 'https://deepl.togglecorp.com';
        default:
            return process.env.REACT_APP_DEEPL_DOMAIN || 'http://192.168.1.66:8010';
    }
};

const deeplEndPoint = getDeeplEndPoint();

export const urlForNer = `${deeplEndPoint}/api/ner/`;
export const urlForFeedback = `${deeplEndPoint}/api/v2/recommendation/`;

export const createParamsForNer = text => ({
    method: POST,
    headers: commonHeaderForPostExternal,
    body: JSON.stringify({
        text,
    }),
});

export const urlForLeadClassify = `${deeplEndPoint}/api/v2/classify/`;

// TODO: remove these fake endpoints
const isProjectTest = (project) => {
    if (project.title === 'Board Demo') {
        return true;
    }
    return false;
};
export const createUrlForLeadTopicModeling = (project, isFilter) =>
    `${deeplEndPoint}/api/topic-modeling/?test=${isProjectTest(project)}&filter=${isFilter}`;
export const createUrlForLeadTopicCorrelation = (project, isFilter) =>
    `${deeplEndPoint}/api/subtopics/correlation/?test=${isProjectTest(project)}&filter=${isFilter}`;
export const createUrlForLeadNerDocsId = (project, isFilter) =>
    `${deeplEndPoint}/api/ner-docs/?test=${isProjectTest(project)}&filter=${isFilter}`;
export const createUrlForLeadKeywordCorrelation = (project, isFilter) =>
    `${deeplEndPoint}/api/keywords/correlation/?test=${isProjectTest(project)}&filter=${isFilter}`;

// export const urlForLeadTopicModeling = `${deeplEndPoint}/api/topic-modeling/`;
// export const urlForLeadTopicCorrelation = `${deeplEndPoint}/api/subtopics/correlation/`;
// export const urlForLeadNerDocsId = `${deeplEndPoint}/api/ner-docs/`;
// export const urlForLeadKeywordCorrelation = `${deeplEndPoint}/api/keywords/correlation/`;

// endpoint for project clustering
export const createUrlForProjectClusterData = modelId => `${deeplEndPoint}/api/cluster-data/?cluster_model_id=${modelId}`;

export const createUrlForInitClusterRequest = `${deeplEndPoint}/api/cluster/`;

export const createParamsForProjectClusterData = () => ({
    method: GET,
    headers: commonHeaderForGetExternal,
});

export const createParamsForInitClusterRequest = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: commonHeaderForPostExternal,
});

export const createParamsForLeadClassify = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: commonHeaderForPostExternal,
});

export const createParamsForFeedback = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: commonHeaderForPostExternal,
});

export const createParamsForLeadTopicModeling = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: commonHeaderForPostExternal,
});

export const createParamsForLeadTopicCorrelation = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: commonHeaderForPostExternal,
});

export const createParamsForLeadNer = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: commonHeaderForPostExternal,
});

export const createParamsForLeadKeywordCorrelation = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: commonHeaderForPostExternal,
});

export const createUrlForGoogleViewer = docUrl =>
    `https://drive.google.com/viewerng/viewer?${p({
        url: docUrl,
        pid: 'explorer',
        efh: false,
        a: 'v',
        chrome: false,
        embedded: true,
    })}`;
