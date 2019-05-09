// eslint-disable-next-line import/prefer-default-export
export const currentThemeIdSelector = (state) => {
    const {
        domainData: {
            currentThemeId,
        },
    } = state;

    return currentThemeId || 'default';
};
