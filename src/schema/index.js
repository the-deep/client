import Dict, { basicTypes } from '@togglecorp/ravl';

import leads from './leads';
import leadsViz from './leadsViz';
import entries from './entries';
import emm from './emm';
import entryComments from './entryComments';
import projects from './projects';
import regions from './regions';
import connectors from './connectors';
import userExports from './userExports';
import token from './token';
import userGroups from './userGroups';
import entryGroups from './entryGroups';
import users from './users';
import analysisFrameworks from './analysisFrameworks';
import assessmentRegistry from './assessmentRegistry';
import categoryEditors from './categoryEditors';
import galleryFile from './galleryFile';
import langauges from './languages';
import notifications from './notifications';
import clusterViz from './clusterViz';
import pageInfoSchema from './pagesInfo';
import tabularSchema from './tabular';
import plannedArys from './plannedAry';

const basicTypeSchemas = basicTypes.map(entry => ({ name: entry.doc.name, schema: entry }));

const userDefinedSchemas = [];

// TODO: add errorResponse and successResponse in Rest Request

{
    const name = 'dbentity';
    const schema = {
        doc: {
            name: 'Database Entity',
            description: 'Defines all the attributes common to db entities',
        },
        fields: {
            createdAt: { type: 'string', required: true }, // date
            createdBy: { type: 'uint' },
            createdByName: { type: 'string' },
            id: { type: 'uint', required: true },
            modifiedAt: { type: 'string', required: true }, // date
            modifiedBy: { type: 'uint' },
            modifiedByName: { type: 'string' },
            versionId: { type: 'uint', required: true },
        },
    };
    userDefinedSchemas.push({ name, schema });
}
{
    const name = 'keyValuePair';
    const schema = {
        doc: {
            name: 'Key Value Pair',
            description: 'Defines key value pair',
        },
        fields: {
            key: { type: 'uint', required: true },
            value: { type: 'string', required: true },
        },
    };
    userDefinedSchemas.push({ name, schema });
}

{
    const name = 'idTitlePair';
    const schema = {
        doc: {
            name: 'Id title pair',
            description: 'Id title pair',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
        },
    };
    userDefinedSchemas.push({ name, schema });
}

{
    const name = 'keyValuePairSS';
    const schema = {
        doc: {
            name: 'Key Value Pair',
            description: 'Defines key value pair where key and value both are strings',
        },
        fields: {
            key: { type: 'string', required: true },
            value: { type: 'string', required: true },
        },
    };
    userDefinedSchemas.push({ name, schema });
}

{
    const name = 'keyValuePairNS';
    const schema = {
        doc: {
            name: 'Key Value Pair',
            description: 'Defines key value pair where key is number and value is string',
        },
        fields: {
            key: { type: 'number', required: true },
            value: { type: 'string', required: true },
        },
    };
    userDefinedSchemas.push({ name, schema });
}

{
    const name = 'timevalue';
    const schema = {
        doc: {
            name: 'Time Value',
            description: 'Array of timevalue represents a timeseries',
        },
        fields: {
            date: { type: 'string', required: true }, // date
            count: { type: 'uint', required: true },
        },
    };
    userDefinedSchemas.push({ name, schema });
}


const isBeta = process.env.REACT_APP_DEEP_ENVIRONMENT === 'beta';
const isProd = process.env.REACT_APP_DEEP_ENVIRONMENT === 'prod';
const dict = new Dict(
    isBeta || isProd ? { warning: false } : { warning: true },
);

[
    ...basicTypeSchemas,
    ...userDefinedSchemas,
    ...emm,
    ...leads,
    ...leadsViz,
    ...entries,
    ...entryComments,
    ...projects,
    ...regions,
    ...connectors,
    ...userExports,
    ...token,
    ...userGroups,
    ...entryGroups,
    ...users,
    ...analysisFrameworks,
    ...assessmentRegistry,
    ...plannedArys,
    ...categoryEditors,
    ...galleryFile,
    ...langauges,
    ...notifications,
    ...clusterViz,
    ...pageInfoSchema,
    ...tabularSchema,
].forEach(({ name, schema }) => dict.put(name, schema));

export default dict;
