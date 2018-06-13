import update from '#rs/utils/immutable-update';

export const CV__SET_PROJECT_CLUSTER_VISUALIZATION = 'siloDomainData/SET_PROJECT_CLUSTER_VISUALIZATION';

// ACTION-CREATOR

export const setProjectClusterDataAction = ({
    projectId,
    clusterData,
}) => ({
    projectId,
    clusterData,
    type: CV__SET_PROJECT_CLUSTER_VISUALIZATION,
});

// REDUCER

const setProjectClusterData = (state, action) => {
    const {
        projectId,
        clusterData,
    } = action;

    const settings = {
        clusterVisualization: {
            [projectId]: { $auto: {
                clusterData: { $autoArray: {
                    $set: clusterData,
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
