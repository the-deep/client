import { createSelector } from 'reselect';
import { isTruthy } from '@togglecorp/fujs';

import {
    createSchema,
    createComputeSchema,
    shouldShowHNO,
    shouldShowCNA,
} from '#entities/editAry';

import {
    leadIdFromRouteSelector,
    leadGroupIdFromRouteSelector,
} from '../route';
import {
    assessmentPillarsSelector,
    assessmentMatrixPillarsSelector,
    assessmentScoreScalesSelector,
    assessmentScoreBucketsSelector,
    assessmentFocusesSelector,
    aryTemplateMetadataSelector,
    aryTemplateMethodologySelector,
    aryTemplateQuestionnaireListSelector,
} from '../domainData/props-with-state';

const emptyObject = {};
const emptyList = [];

// HELPERS

const getNamespacedId = (leadId, leadGroupId) => {
    if (isTruthy(leadGroupId)) {
        return `lead-group-${leadGroupId}`;
    } else if (isTruthy(leadId)) {
        return `lead-${leadId}`;
    }
    return undefined;
};

// ARY VIEW SELECTORS

const editArySelector = ({ siloDomainData }) => (
    siloDomainData.editAry || emptyObject
);

const editAryFromRouteSelector = createSelector(
    editArySelector,
    leadGroupIdFromRouteSelector,
    leadIdFromRouteSelector,
    (view, leadGroupId, leadId) => {
        const id = getNamespacedId(leadId, leadGroupId);
        return view[id] || emptyObject;
    },
);

export const editAryServerIdSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.serverId,
);

export const editAryVersionIdSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.versionId,
);

export const editAryHasErrorsSelector = createSelector(
    editAryFromRouteSelector,
    ary => !!ary.hasErrors,
);

export const editAryIsPristineSelector = createSelector(
    editAryFromRouteSelector,
    ary => !!ary.isPristine,
);

export const editAryFaramErrorsSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.faramErrors || emptyObject,
);

export const editAryFaramValuesSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.faramValues || emptyObject,
);

export const editAryEntriesSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.entries || emptyList,
);

export const editAryLeadSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.lead || emptyObject,
);

export const editArySelectedSectorsSelector = createSelector(
    editAryFaramValuesSelector,
    (faramValues) => {
        const methodology = faramValues.methodology || emptyObject;
        return methodology.sectors || emptyList;
    },
);

export const editArySelectedFocusesSelector = createSelector(
    editAryFaramValuesSelector,
    (faramValues) => {
        const methodology = faramValues.methodology || emptyObject;
        return methodology.focuses || emptyList;
    },
);

export const editAryShouldShowHNO = createSelector(
    editAryFaramValuesSelector,
    (faramValues) => {
        const {
            metadata: {
                basicInformation = emptyObject,
            } = {},
        } = faramValues;
        return shouldShowHNO(basicInformation);
    },
);

export const editAryShouldShowCNA = createSelector(
    editAryFaramValuesSelector,
    (faramValues) => {
        const {
            metadata: {
                basicInformation = emptyObject,
            } = {},
        } = faramValues;
        return shouldShowCNA(basicInformation);
    },
);

// helpers

export const assessmentSchemaSelector = createSelector(
    aryTemplateMetadataSelector,
    aryTemplateMethodologySelector,
    aryTemplateQuestionnaireListSelector,

    assessmentFocusesSelector,
    assessmentPillarsSelector,
    assessmentMatrixPillarsSelector,

    editArySelectedSectorsSelector,
    editArySelectedFocusesSelector,
    editAryShouldShowHNO,
    editAryShouldShowCNA,

    createSchema,
);

export const assessmentComputeSchemaSelector = createSelector(
    assessmentPillarsSelector,
    assessmentMatrixPillarsSelector,
    assessmentScoreScalesSelector,
    assessmentScoreBucketsSelector,
    aryTemplateQuestionnaireListSelector,
    editAryShouldShowHNO,
    editAryShouldShowCNA,

    createComputeSchema,
);
