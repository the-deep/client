import localforage from 'localforage';
import {
    createMigrate,
    createTransform,
} from 'redux-persist';

import { mapToMap } from '#rsu/common';

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

export const reducersToSync = [
    'lang',
    'auth',
    'domainData',
    'siloBgTasks', // Middleware
];

export default storeConfig;
