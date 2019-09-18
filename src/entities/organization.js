// eslint-disable-next-line import/prefer-default-export
export const organizationTitleSelector = (org) => {
    if (org.mergedAs) {
        return org.mergedAs.title;
    }
    return org.title;
};

