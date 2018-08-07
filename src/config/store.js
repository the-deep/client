import localforage from 'localforage';
import { createTransform } from 'redux-persist';

import { mapToMap } from '#rsu/common';

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

const storeConfig = {
    blacklist: ['notify', 'route', 'app'],
    key: 'deeper',
    version: 1,
    storage: localforage,
    transforms: [myTransform],
};

export const reducersToSync = [
    'lang',
    'auth',
    'domainData',
    'siloBgTasks', // Middleware
];

export default storeConfig;
