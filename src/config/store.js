import localforage from 'localforage';
import {
    createMigrate,
    createTransform,
} from 'redux-persist';

import { mapToMap, randomString } from '#rsu/common';

export const uniqueTabId = randomString(64);

const migrations = {
    // NOTE: clear out domainData and siloDomainData only
    2: ({ auth, lang }) => ({ auth, lang }),
};

const myTransform = createTransform(
    inboundState => ({
        ...inboundState,
        addLeadView: {
            ...inboundState.addLeadView,
            leadRests: undefined,
            leadUploads: undefined,
            leadDriveRests: undefined,
            leadDropboxRests: undefined,

            removeModalState: undefined,
        },
        editEntries: mapToMap(
            inboundState.editEntries,
            k => k,
            obj => ({ ...obj, entryRests: undefined }),
        ),
    }),
    undefined,
    { whitelist: ['siloDomainData'] },
);

const isBeta = process.env.REACT_APP_DEEP_ENVIRONMENT === 'beta';

const storeConfig = {
    blacklist: ['notify', 'route', 'app'],
    key: 'deeper',
    version: 2,
    storage: localforage,
    transforms: [myTransform],
    migrate: createMigrate(migrations, { debug: !isBeta }),
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
];

export const reduxExtensionEnvs = ['nightly', 'alpha'];

export default storeConfig;
