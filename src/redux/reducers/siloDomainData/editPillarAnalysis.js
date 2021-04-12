import update from '#rsu/immutable-update';

export const PA__SET_DATA = 'siloDomainData/CE__SET_DATA';

export const setPillarAnalysisDataAction = ({ id, data, pristine }) => ({
    type: PA__SET_DATA,
    id,
    data,
    pristine,
});

const setPillarAnalysisData = (state, action) => {
    const { id, data, pristine } = action;

    const settings = {
        editPillarAnalysis: {
            [id]: { $auto: {
                id: { $set: id },
                data: { $set: data },
                pristine: { $set: pristine },
            } },
        },
    };

    return update(state, settings);
};
const reducers = {
    [PA__SET_DATA]: setPillarAnalysisData,
};

export default reducers;
