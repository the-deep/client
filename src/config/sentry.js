import Raven from 'raven-js';

const enableRaven = process.env.NODE_ENV === 'production';

// Sentry Config For BoundError
export const ravenInitialize = () => {
    if (enableRaven) {
        Raven.config('https://2ab54c5cc4b24ebd8efca460aeb15e07@sentry.io/1216180').install();
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
    // FIXME: don't handle exception when in development mode
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
