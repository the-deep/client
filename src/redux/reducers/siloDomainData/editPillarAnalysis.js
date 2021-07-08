import update from '#rsu/immutable-update';

export const PA__SET_DATA = 'siloDomainData/CE__SET_DATA';

export const setPillarAnalysisDataAction = ({ id, data, pristine, versionId }) => ({
    type: PA__SET_DATA,
    id,
    data,
    pristine,
    versionId,
});

const setPillarAnalysisData = (state, action) => {
    const { id, data, pristine, versionId } = action;

    const settings = {
        editPillarAnalysis: {
            [id]: { $auto: {
                id: { $set: id },
                data: { $set: data },
                pristine: { $set: pristine },
                versionId: { $set: versionId },
            } },
        },
    };

    return update(state, settings);
};
const reducers = {
    [PA__SET_DATA]: setPillarAnalysisData,
};

export default reducers;
