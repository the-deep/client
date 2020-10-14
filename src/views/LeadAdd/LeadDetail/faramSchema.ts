// NOTE: This component has also been used in Leads Table to quick edit leads

import {
    requiredCondition,
    urlCondition,
    dateCondition,
    ObjectSchema,
    ObjectSchemaWithIdentifier,
} from '@togglecorp/faram';
import {
    LEAD_TYPE,
} from '../utils';

const commonFields: ObjectSchema['fields'] = {
    title: [requiredCondition],
    source: [requiredCondition],
    authors: [],
    confidentiality: [requiredCondition],
    assignee: [requiredCondition],
    publishedOn: [requiredCondition, dateCondition],
    sourceType: [requiredCondition],
    project: [requiredCondition],
    priority: [requiredCondition],

    tabularBook: [],

    leadGroup: [],
};

const fieldsWithAttachment: ObjectSchema['fields'] = {
    ...commonFields,
    attachment: [requiredCondition],
};
const fieldsWithUrl: ObjectSchema['fields'] = {
    ...commonFields,
    url: [requiredCondition, urlCondition],
    website: [requiredCondition],
    emmEntities: [],
    emmTriggers: [],
};
const fieldsWithText: ObjectSchema['fields'] = {
    ...commonFields,
    text: [requiredCondition],
};

const schema: ObjectSchemaWithIdentifier = {
    identifier: faramValues => (faramValues as { sourceType: string }).sourceType,
    fields: {
        [LEAD_TYPE.dropbox]: fieldsWithAttachment,
        [LEAD_TYPE.drive]: fieldsWithAttachment,
        [LEAD_TYPE.file]: fieldsWithAttachment,
        [LEAD_TYPE.website]: fieldsWithUrl,
        [LEAD_TYPE.text]: fieldsWithText,
    },
};

export default schema;
