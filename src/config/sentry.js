import Raven from 'raven-js';

// Sentry Config For BoundError
export const ravenInitialize = () => {
    if (process.env.NODE_ENV === 'production') {
        Raven.config('https://2ab54c5cc4b24ebd8efca460aeb15e07@sentry.io/1216180').install();
    }
};

export const setRavenUser = (user) => {
    if (process.env.NODE_ENV === 'production') {
        Raven.setUserContext({
            id: user.userId,
            isSuperuser: user.isSuperuser,
            email: user.username,
            name: user.displayName,
        });
    }
};
