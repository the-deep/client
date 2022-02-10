export const openZendeskFeedback = () => {
    if (window.zE) {
        window.zE.activate({ hideOnClose: true });
    }
};

export const setUserOnZendesk = (user) => {
    if (window.zE) {
        window.zE(() => {
            window.zE.identify({
                id: user ? user.id : undefined,
                name: user ? user.displayName : undefined,
                email: user ? user.email : undefined,
            });
        });
    }
};
