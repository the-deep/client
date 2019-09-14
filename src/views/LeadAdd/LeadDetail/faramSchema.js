import {
    requiredCondition,
    urlCondition,
    dateCondition,
} from '@togglecorp/faram';
import {
    LEAD_TYPE,
} from '../utils';

const commonFields = {
    title: [requiredCondition],
    source: [requiredCondition],
    author: [requiredCondition],
    confidentiality: [requiredCondition],
    assignee: [requiredCondition],
    publishedOn: [requiredCondition, dateCondition],
    sourceType: [requiredCondition],
    project: [requiredCondition],

    tabularBook: [],

    leadGroup: [],

    emmEntities: [],
    emmTriggers: [],
};

const schema = {
    identifier: faramValues => faramValues.sourceType,
    fields: {
        [LEAD_TYPE.file]: {
            ...commonFields,
            attachment: [requiredCondition],
        },
        [LEAD_TYPE.dropbox]: {
            ...commonFields,
            attachment: [requiredCondition],
        },
        [LEAD_TYPE.drive]: {
            ...commonFields,
            attachment: [requiredCondition],
        },
        [LEAD_TYPE.website]: {
            ...commonFields,
            url: [requiredCondition, urlCondition],
            website: [requiredCondition],
        },
        [LEAD_TYPE.text]: {
            ...commonFields,
            text: [requiredCondition],
        },
    },
};

export default schema;
