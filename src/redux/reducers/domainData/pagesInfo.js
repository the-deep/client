import update from '#rsu/immutable-update';
import { listToMap } from '@togglecorp/fujs';

// TYPE

export const SET_PAGES_INFO = 'domainData/SET_PAGES_INFO';

// ACTION-CREATOR

export const setPagesInfoAction = ({ pagesInfo }) => ({
    type: SET_PAGES_INFO,
    pagesInfo,
});

// REDUCER

const setPagesInfo = (state, action) => {
    const { pagesInfo } = action;

    const settings = {
        pagesInfo: {
            $set: listToMap(pagesInfo, pageInfo => pageInfo.pageId),
        },
    };
    return update(state, settings);
};


const reducers = {
    [SET_PAGES_INFO]: setPagesInfo,
};
export default reducers;
