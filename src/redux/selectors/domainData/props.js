import { isFalsy } from '@togglecorp/fujs';

// gets identifier from route or prop
const getFromProps = identifier => ({ route }, props) => {
    if (!isFalsy(props) && !isFalsy(props[identifier])) {
        return props[identifier];
    }
    if (route.params) {
        return route.params[identifier];
    }
    return undefined;
};

export const afIdFromRoute = getFromProps('analysisFrameworkId');
export const ceIdFromRoute = getFromProps('categoryEditorId');
export const wordCategoryIdFromRoute = getFromProps('wordCategoryId');
export const countryIdFromRoute = getFromProps('countryId');
export const groupIdFromRoute = getFromProps('userGroupId');
export const leadIdFromRoute = getFromProps('leadId');
export const entryIdFromRoute = getFromProps('entryId');
export const projectIdFromRoute = getFromProps('projectId');
export const userIdFromRoute = getFromProps('userId');
export const connectorIdFromRoute = getFromProps('connectorId');
export const questionnaireIdFromRoute = getFromProps('questionnaireId');
export const pillarAnalysisIdFromRoute = getFromProps('pillarId');
