const clusterVizSchema = [];

{
    const name = 'initClusterRequest';
    const schema = {
        doc: {
            name: 'Project Cluster Start Request',
            description: 'start clustering for project',
        },
        // TODO: convert to camelCase when bewakes api.
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
            name: 'Sigle cluster data',
            description: 'Sigle cluster data',
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
    const name = 'clusterDataResponse';
    const schema = {
        doc: {
            name: 'Project Cluster Data Response',
            description: 'Response of project clustering',
        },
        fields: {
            clusterData: { type: 'array.cluster' },
            message: { type: 'string' },
        },
    };
    clusterVizSchema.push({ name, schema });
}

export default clusterVizSchema;
