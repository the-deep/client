import defaultColors from '#rsu/styles/default/colors';

const colorAccent = '#d81b60';
const colorPrimary = '#5E35b1';
const colorBackgroundAccentHint = 'rgba(216, 27, 96, .05)';
const colorNavbar = colorPrimary;
const colorTextOnNavbar = defaultColors.colorTextOnDark;
const colorSeparatorOnNavbar = 'rgba(255, 255, 255, .1)';
const colorSeparatorHoverOnNavbar = 'rgba(255, 255, 255, .3)';
const colorNavbarActiveMenuItemBorder = defaultColors.colorTextOnDark;
const colorNavbarActiveMenuItem = defaultColors.colorTextOnDark;
const colorNavbarMenuItemHover = defaultColors.colorTextOnDark;

const colors = {
    ...defaultColors,
    colorNavbar,
    colorTextOnNavbar,
    colorAccent,
    colorBackgroundAccentHint,
    colorPrimary,
    colorSeparatorOnNavbar,
    colorSeparatorHoverOnNavbar,
    colorNavbarActiveMenuItemBorder,
    colorNavbarActiveMenuItem,
    colorNavbarMenuItemHover,
};

export default colors;
