import update from '#rsu/immutable-update';

export const CV__SET_PROJECT_CLUSTER_VISUALIZATION = 'siloDomainData/SET_PROJECT_CLUSTER_VISUALIZATION';

// ACTION-CREATOR

export const setProjectClusterDataAction = ({
    projectId,
    keywords,
    documents,
}) => ({
    projectId,
    keywords,
    documents,
    type: CV__SET_PROJECT_CLUSTER_VISUALIZATION,
});

// REDUCER

const setProjectClusterData = (state, action) => {
    const {
        projectId,
        keywords,
        documents,
    } = action;

    const settings = {
        clusterVisualization: {
            [projectId]: { $auto: {
                keywords: { $autoArray: {
                    $set: keywords,
                } },
                documents: { $autoArray: {
                    $set: documents,
                } },
            } },
        },
    };

    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [CV__SET_PROJECT_CLUSTER_VISUALIZATION]: setProjectClusterData,
};

export default reducers;
