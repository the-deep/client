import localforage from 'localforage';
import {
    createMigrate,
    createTransform,
} from 'redux-persist';
import produce from 'immer';
import { randomString } from '@togglecorp/fujs';

import {
    isBeta,
    isProd,
} from './env';

// FIXME: move to config/env
export const uniqueTabId = randomString(64);

const migrations = {
    // NOTE: clear out domainData and siloDomainData only
    2: ({ auth, lang }) => ({ auth, lang }),
    3: () => ({}),
    4: (state) => {
        // Clearing out siloDomainData.connectorsView
        if (state && state.siloDomainData && state.siloDomainData.connectorsView) {
            return {
                ...state,
                siloDomainData: {
                    ...state.siloDomainData,
                    connectorsView: {},
                },
            };
        }
        return state;
    },
};

const myTransform = createTransform(
    inboundState => produce(inboundState, (state) => {
        if (state.editEntries) {
            Object.keys(state.editEntries).forEach((key) => {
                if (state.editEntries[key]) {
                    // eslint-disable-next-line no-param-reassign
                    delete state.editEntries[key].entryRests;
                    // eslint-disable-next-line no-param-reassign
                    delete state.editEntries[key].entryGroupRests;
                    // eslint-disable-next-line no-param-reassign
                    delete state.editEntries[key].tabularData;
                }
            });
        }
    }),
    undefined,
    { whitelist: ['siloDomainData'] },
);

const storeConfig = {
    blacklist: ['notify', 'route', 'app'],
    key: 'deeper',
    version: 4,
    storage: localforage,
    transforms: [myTransform],
    migrate: createMigrate(migrations, { debug: !isBeta || !isProd }),
};


// Note: these are not actually reducers but the prefixes in the
// action types.
// It might be better to rename this to actionsToSync
export const reducersToSync = [
    'lang',
    'auth',
    'domainData',
    'tabStatus',
];

export const actionsToSkipLogging = [
    'tabStatus/SET_TAB_TIME',
    'tabStatus/SET_TAB_STATUS',
    'tabStatus/REMOVE_TAB_STATUS',
    'tabStatus/REMOVE_SELF_TAB_STATUS',
    'domainData/SET_NOTIFICATIONS_COUNT',
];

export const reduxExtensionEnvs = ['nightly', 'alpha'];

export default storeConfig;
