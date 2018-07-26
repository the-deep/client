const clusterVizSchema = [];

{
    const name = 'initClusterRequest';
    const schema = {
        doc: {
            name: 'Project Cluster Start Request',
            description: 'start clustering for project',
        },
        // TODO: convert to camelCase when bewakes@togglecorp.com fixes the api.
        fields: {
            cluster_model_id: { type: 'number', required: true },
            message: { type: 'string' },
        },
    };
    clusterVizSchema.push({ name, schema });
}

{
    const name = 'cluster';
    const schema = {
        doc: {
            name: 'Single cluster data',
            description: 'Single cluster data',
        },
        fields: {
            value: { type: 'string' },
            cluster: { type: 'uint' },
            score: { type: 'uint' },
        },
    };
    clusterVizSchema.push({ name, schema });
}

{
    const name = 'clusterDocs';
    const schema = {
        doc: {
            name: 'Cluster Docs',
            description: 'Map of document id',
        },
        fields: {
            '*': { type: 'array.number', required: true },
        },
    };
    clusterVizSchema.push({ name, schema });
}

{
    const name = 'leadDetails';
    const schema = {
        doc: {
            name: 'Lead',
            description: 'Single lead data',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
            classifiedDocId: { type: 'uint' },
            createdAt: { type: 'string' },
        },
    };
    clusterVizSchema.push({ name, schema });
}

{
    const name = 'leadsDetailForClusterDocs';
    const schema = {
        dopc: {
            name: 'Filtered leads',
            description: 'Filtered leads data',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.leadDetails', required: true },
        },
    };
    clusterVizSchema.push({ name, schema });
}

{
    const name = 'clusterDataResponse';
    const schema = {
        doc: {
            name: 'Project Cluster Data Response',
            description: 'Response of project clustering',
        },
        // TODO: convert to camelCase when bewakes@togglecorp.com fixes the api.
        fields: {
            keywords: { type: 'array.cluster', required: true },
            full_clustered: { type: 'boolean' },
            docs: { type: 'clusterDocs', required: true },
        },
    };
    clusterVizSchema.push({ name, schema });
}

export default clusterVizSchema;
