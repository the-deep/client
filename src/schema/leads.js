const leadSchema = [];

{
    const name = 'organizationSmall';
    const schema = {
        doc: {
            name: 'organizationSmall',
            description: 'Organization small',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
            shortName: { type: 'string' },
            logo: { type: 'string' },
        },
    };
    leadSchema.push({ name, schema });
}

{
    const name = 'lead';
    const schema = {
        doc: {
            name: 'Lead',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            sourceType: { type: 'string' }, // set is required later
            assignee: { type: 'uint' },
            leadGroup: { type: 'uint' },
            assigneeDetails: { type: 'user-s' },
            attachment: { type: 'object' }, // file url
            confidentiality: { type: 'string', required: true },
            confidentialityDisplay: { type: 'string' },
            entriesCount: { type: 'int' },
            project: { type: 'uint' },
            publishedOn: { type: 'string' },
            sourceRaw: { type: 'string' },
            priority: { type: 'number' },
            priorityDisplay: { type: 'string' },
            authorRaw: { type: 'string' },
            sourceDetail: { type: 'organizationSmall' },
            authorDetail: { type: 'organizationSmall' },
            authorsDetail: { type: 'array.organizationSmall' },
            source: { type: 'uint' }, // url
            author: { type: 'uint' },
            assessmentId: { type: 'uint' },
            authors: { type: 'array.uint' },
            status: { type: 'string', required: true },
            text: { type: 'string' },
            title: { type: 'string', required: true },
            url: { type: 'string' },
            website: { type: 'string' },
            classifiedDocId: { type: 'number' },
            tabularBook: { type: 'uint' },
            pageCount: { type: 'int' },
            wordCount: { type: 'int' },
            thumbnailHeight: { type: 'int' },
            thumbnailWidth: { type: 'int' },
            thumbnail: { type: 'string' }, // url
            emmEntities: { type: 'array.emmEntity' },
            emmTriggers: { type: 'array.emmTrigger' },
        },
    };
    leadSchema.push({ name, schema });
}
{
    const name = 'leadClassifiedDocumentId';
    const schema = {
        doc: {
            name: 'Lead Classifed Document ID',
            description: 'Lead with Classifed Document ID',
        },
        fields: {
            classifiedDocId: { type: 'number' },
        },
    };
    leadSchema.push({ name, schema });
}

{
    const name = 'leadsGetResponse';
    const schema = {
        doc: {
            name: 'Lead Get Response',
            description: 'Response for GET /leads/?params',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.lead', required: true },
        },
    };
    leadSchema.push({ name, schema });
}
{
    const name = 'leadsCDIdGetResponse';
    const schema = {
        doc: {
            name: 'Lead Classified Doc Id GET Response',
            description: 'Response for GET /leads/?params',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.leadClassifiedDocumentId', required: true },
        },
    };
    leadSchema.push({ name, schema });
}

{
    const name = 'projectLeadFilterOptions';
    const schema = {
        doc: {
            name: 'Project Lead Filter Options',
            description: 'Filter options of leads for project',
        },
        fields: {
            status: { type: 'array.keyValuePairSS' },
            project: { type: 'array.keyValuePairSS' },
            assignee: { type: 'array.keyValuePairSS' },
            leadGroup: { type: 'array.keyValuePairSS' },
            priority: { type: 'array.keyValuePairNS' },
            confidentiality: { type: 'array.keyValuePairSS' },
            organizationTypes: { type: 'array.keyValuePairSS' },
            hasEmmLeads: { type: 'boolean' },
            emmEntities: { type: 'array.emmEntityFilterOption' },
            emmRiskFactors: { type: 'array.emmTriggerFilterOption' },
            emmKeywords: { type: 'array.emmTriggerFilterOption' },
        },
    };
    leadSchema.push({ name, schema });
}

{
    const name = 'leadGroup';
    const schema = {
        doc: {
            name: 'LeadGroup',
            description: 'One of the main entities',
        },
        fields: {
            id: { type: 'uint', required: true },
            project: { type: 'uint' },
            title: { type: 'string', required: true },
            versionId: { type: 'uint', required: true },
            leads: { type: 'array', required: false },
        },
    };
    leadSchema.push({ name, schema });
}

{
    const name = 'leadGroupFull';
    const schema = {
        doc: {
            name: 'LeadGroup',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            id: { type: 'uint', required: true },
            project: { type: 'uint' },
            title: { type: 'string', required: true },
            versionId: { type: 'uint', required: true },
            leads: { type: 'array', required: false },
            noOfLeads: { type: 'uint', required: false },
        },
    };
    leadSchema.push({ name, schema });
}

{
    const name = 'leadsCopy';
    const schema = {
        doc: {
            name: 'leadsCopy',
            description: 'Response for leads copy to other projects',
        },
        fields: {
            projects: { type: 'array.uint', required: true },
            leads: { type: 'array.uint', required: true },
            leadsByProjects: {
                type: {
                    doc: { name: 'map of leads' },
                    fields: {
                        '*': { type: 'array.uint', required: true },
                    },
                },
            },
        },
    };
    leadSchema.push({ name, schema });
}

{
    const name = 'leadGroupsGetResponse';
    const schema = {
        doc: {
            name: 'Lead Get Response',
            description: 'Response for GET /leadgroups/?params',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.leadGroupFull', required: true },
        },
    };
    leadSchema.push({ name, schema });
}


export default leadSchema;
