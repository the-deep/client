import {
    GET,
    POST,
    commonHeaderForGetExternal,
    commonHeaderForPostExternal,
    p,
    deeplEndPoint,
} from '#config/rest';

export const urlForNer = `${deeplEndPoint}/api/ner/?case=snakecase`;
export const urlForFeedback = `${deeplEndPoint}/api/v2/recommendation/?case=snakecase`;

export const createParamsForNer = text => ({
    method: POST,
    headers: commonHeaderForPostExternal,
    body: JSON.stringify({
        text,
    }),
});

export const urlForLeadClassify = `${deeplEndPoint}/api/v2/classify/?case=snakecase`;

// TODO: remove these fake endpoints
const isProjectTest = (project) => {
    if (project.title === 'Board Demo') {
        return true;
    }
    return false;
};
export const createUrlForLeadTopicModeling = (project, isFilter) =>
    `${deeplEndPoint}/api/topic-modeling/?test=${isProjectTest(project)}&filter=${isFilter}&case=snakecase`;
export const createUrlForLeadTopicCorrelation = (project, isFilter) =>
    `${deeplEndPoint}/api/subtopics/correlation/?test=${isProjectTest(project)}&filter=${isFilter}&case=snakecase`;
export const createUrlForLeadNerDocsId = (project, isFilter) =>
    `${deeplEndPoint}/api/ner-docs/?test=${isProjectTest(project)}&filter=${isFilter}&case=snakecase`;
export const createUrlForLeadKeywordCorrelation = (project, isFilter) =>
    `${deeplEndPoint}/api/keywords/correlation/?test=${isProjectTest(project)}&filter=${isFilter}&case=snakecase`;

/*
export const urlForLeadTopicModeling =
    `${deeplEndPoint}/api/topic-modeling/?case=snakecase`;
export const urlForLeadTopicCorrelation
    = `${deeplEndPoint}/api/subtopics/correlation/?case=snakecase`;
export const urlForLeadNerDocsId
    = `${deeplEndPoint}/api/ner-docs/?case=snakecase`;
export const urlForLeadKeywordCorrelation
    = `${deeplEndPoint}/api/keywords/correlation/?case=snakecase`;
*/

// endpoint for project clustering
export const createUrlForProjectClusterData = modelId => `${deeplEndPoint}/api/cluster-data/?cluster_model_id=${modelId}&case=snakecase`;

export const createUrlForInitClusterRequest = `${deeplEndPoint}/api/cluster/?case=snakecase`;

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
