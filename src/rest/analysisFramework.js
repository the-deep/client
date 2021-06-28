import {
    POST,
    wsEndpoint,
    PATCH,
    commonHeaderForPost,
    p,
} from '#config/rest';

const afsUrlFields = ['id', 'title', 'version_id', 'created_at', 'modified_at',
    'is_admin', 'description', 'entries_count'];

export const urlForAnalysisFrameworks = `${wsEndpoint}/analysis-frameworks/?${p({ fields: afsUrlFields })}`;

export const urlForAfCreate = `${wsEndpoint}/analysis-frameworks/`;

export const createUrlForProjectFramework = projectId => (`
    ${wsEndpoint}/projects/${projectId}/analysis-framework/
`);

export const createUrlForAfClone = analysisFrameworkId => (
    `${wsEndpoint}/clone-analysis-framework/${analysisFrameworkId}/`
);

export const createUrlForAnalysisFramework = analysisFrameworkId => (
    `${wsEndpoint}/analysis-frameworks/${analysisFrameworkId}/`
);

export const createParamsForAfCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForAfClone = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForAnalysisFrameworkEdit = data => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});
