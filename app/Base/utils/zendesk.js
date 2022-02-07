export const openZendeskFeedback = () => {
    if (window.zE) {
        window.zE.activate({ hideOnClose: true });
    }
};

const enableZe = () => window.zE;

export const setUserOnZendesk = (user) => {
    if (enableZe() && user.id) {
        window.zE(() => {
            window.zE.identify({
                id: user.id,
                name: user.displayName,
                email: user.email,
            });
        });
    }
};
