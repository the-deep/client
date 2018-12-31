// NOTE: User info and lang is set just for auto fill
// NOTE: so no need to deactivate on development
const enableZe = () => window.zE;

export const setZeUser = (user) => {
    if (enableZe() && user.userId) {
        window.zE(() => {
            window.zE.identify({
                id: user.userId,
                name: user.displayName,
                email: user.email,
                isSuperuser: user.isSuperuser,
            });
        });
    }
};

export const setZeLang = (lang) => {
    if (enableZe()) {
        window.zE(() => {
            window.zE.setLocale(lang);
        });
    }
};
