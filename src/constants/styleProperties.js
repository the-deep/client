import defaultColors from '#rsu/styles/default/colors';

const styleProperties = {
    colors: {
        colorSeparatorOnNavbar: defaultColors.colorSeparator,
        colorSeparatorHoverOnNavbar: defaultColors.colorSeparatorHover,
        colorNavbarActiveMenuItemBorder: defaultColors.colorAccent,
        colorNavbarActiveMenuItem: defaultColors.colorAccent,
        colorNavbarMenuItemHover: defaultColors.colorAccent,
        colorHighlight: '#ffff8d',
        colorTextOnHightlight: defaultColors.colorTextOnLight,
        colorShadowLight: 'rgba(0, 0, 0, .1)',
    },

    dimens: {
    },
};

export default styleProperties;

export const convertToNumber = value => value.substring(0, value.length - 2);
