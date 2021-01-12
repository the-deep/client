import {
    wsEndpoint,
    PATCH,
    p,
    commonHeaderForPost,
} from '#config/rest';

export const createUrlForUsers = (fields) => {
    if (fields) {
        return `${wsEndpoint}/users/?${p({ fields })}`;
    }
    return `${wsEndpoint}/users/`;
};

export const createUrlForUser = userId => `${wsEndpoint}/users/${userId}/`;

export const urlForUserPreferences = `${wsEndpoint}/users/me/preferences/`;

export const createUrlForUserPatch = userId => `${wsEndpoint}/users/${userId}/`;
export const createParamsForUserPatch = ({
    firstName,
    lastName,
    organization,
    displayPicture,
    language,
    emailOptOuts,
}) => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        firstName,
        lastName,
        organization,
        displayPicture,
        language,
        emailOptOuts,
    }),
});

export const createUrlForSetUserProject = userId => `${wsEndpoint}/users/${userId}/`;
export const createParamsForSetUserProject = projectId => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        lastActiveProject: projectId,
    }),
});
