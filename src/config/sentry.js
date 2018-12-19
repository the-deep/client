import Raven from 'raven-js';

const enableRaven = process.env.NODE_ENV === 'production';
const dns = 'https://9a60f35c6a1c45fe999727c5f6f7229c@sentry.io/1220157';
const config = {
    environment: process.env.REACT_APP_DEEP_ENVIRONMENT,
    release: process.env.REACT_APP_DEEP_COMMIT_SHA,
    tags: {
        react_store_release: process.env.REACT_APP_DEEP_REACT_STORE_COMMIT_SHA,
        ravl_release: process.env.REACT_APP_DEEP_RAVL_COMMIT_SHA,
    },
};

// Sentry Config For BoundError
export const ravenInitialize = () => {
    if (enableRaven) {
        Raven.config(dns, config).install();
    }
};

export const setRavenUser = (user) => {
    if (enableRaven) {
        Raven.setUserContext({
            id: user.userId,
            isSuperuser: user.isSuperuser,
            email: user.username,
            name: user.displayName,
        });
    }
};

export const handleException = (error, errorInfo) => {
    if (enableRaven && Raven.isSetup()) {
        // NOTE: Only in development error report will be applied twice
        Raven.captureException(error, { extra: errorInfo });
    }
};

export const handleReport = () => {
    // NOTE: Only works after Raven is initialized
    if (enableRaven && Raven.isSetup() && Raven.lastEventId()) {
        Raven.showReportDialog();
    }
};
