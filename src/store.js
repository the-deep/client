import { compose, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from '#redux/middlewares/logger';
import siloBackgroundTasks from '#redux/middlewares/siloBackgroundTasks';
import { sendToken } from '#utils/browserExtension';
import {
    commonHeaderForPost,
    commonHeaderForGet,
    authorizationHeaderForPost,
} from '#config/rest';
import { createActionSyncMiddleware } from '#rs/utils/redux-sync.js';

import reducer from '#redux/reducers';
import { reducersToSync } from '#config/store';

const prepareStore = () => {
    // Invoke refresh access token every 10m
    const middleware = [
        logger,
        createActionSyncMiddleware(reducersToSync),
        siloBackgroundTasks,
        thunk,
    ];

    // Get compose from Redux Devtools Extension
    // eslint-disable-next-line no-underscore-dangle
    const reduxExtensionCompose = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

    // Override compose if development mode and redux extension is installed
    const overrideCompose = process.env.NODE_ENV === 'development' && reduxExtensionCompose;
    const applicableComposer = !overrideCompose
        ? compose
        : reduxExtensionCompose({ /* specify extention's options here */ });

    const enhancer = applicableComposer(
        applyMiddleware(...middleware),
    );
    return createStore(reducer, undefined, enhancer);
};

const injectHeaders = (reduxStore) => {
    const noOp = () => {};

    // eslint-disable-next-line global-require
    const { tokenSelector } = require('./redux/selectors/auth');

    let currentAccess;
    let currentRefresh;
    reduxStore.subscribe(() => {
        const prevAccess = currentAccess;
        const prevRefresh = currentRefresh;
        const token = tokenSelector(reduxStore.getState());
        currentAccess = token.access;
        currentRefresh = token.refresh;

        // If access token changes, then mutate headers
        if (prevAccess !== currentAccess) {
            const bearer = currentAccess ? `Bearer ${currentAccess}` : undefined;
            commonHeaderForPost.Authorization = bearer;
            commonHeaderForGet.Authorization = bearer;
            authorizationHeaderForPost.Authorization = bearer;
        }

        // Sends refresh token to browser extension
        if (prevRefresh !== currentRefresh) {
            sendToken(token).then(noOp, noOp);
        }
    });
};

const isTest = process.env.NODE_ENV === 'test';

// NOTE: replace 'undefined' with an initialState in future if needed
const store = !isTest ? prepareStore() : undefined;
if (!isTest) {
    injectHeaders(store);
}

export default store;
