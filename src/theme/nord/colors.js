import defaultColors from '#rsu/styles/default/colors';

const colorText = defaultColors.colorTextOnDark;

const colorBackground = '#2e3440';
const colorTextOnBackground = colorText;
const colorBackgroundAlt = '#3b4252';
const colorTextOnBackgroundAlt = colorText;

const colorForeground = '#434c5e';
const colorTextOnForeground = colorText;
const colorForegroundAlt = '#4c566a';
const colorTextOnForegroundAlt = colorText;


const colorAccent = '#ebcb8b';
const colorPrimary = '#8fbcbb';

const colorBackgroundAccentHint = 'rgba(216, 27, 96, .05)';
const colorNavbar = colorPrimary;
const colorTextOnNavbar = defaultColors.colorTextOnDark;
const colorSeparatorOnNavbar = 'rgba(255, 255, 255, .1)';
const colorSeparatorHoverOnNavbar = 'rgba(255, 255, 255, .3)';
const colorNavbarActiveMenuItemBorder = defaultColors.colorTextOnDark;
const colorNavbarActiveMenuItem = defaultColors.colorTextOnDark;
const colorNavbarMenuItemHover = defaultColors.colorTextOnDark;
const colorBackgroundHeader = colorBackgroundAlt;
const colorTextOnBackgroundHeader = colorText;
const colorTextLabel = colorText;
const colorBackgroundRow = colorForeground;
const colorTextOnBackgroundRow = colorText;
const colorBackgroundRowAlt = colorForeground;
const colorTextOnBackgroundRowAlt = colorText;


const colors = {
    ...defaultColors,
    colorText,

    colorBackground,
    colorTextOnBackground,
    colorBackgroundAlt,
    colorTextOnBackgroundAlt,

    colorForeground,
    colorTextOnForeground,
    colorForegroundAlt,
    colorTextOnForegroundAlt,

    colorNavbar,
    colorTextOnNavbar,
    colorAccent,
    colorBackgroundAccentHint,
    colorTextLabel,

    colorBackgroundRow,
    colorTextOnBackgroundRow,

    colorBackgroundRowAlt,
    colorTextOnBackgroundRowAlt,

    colorBackgroundHeader,
    colorTextOnBackgroundHeader,


    colorPrimary,
    colorSeparatorOnNavbar,
    colorSeparatorHoverOnNavbar,
    colorNavbarActiveMenuItemBorder,
    colorNavbarActiveMenuItem,
    colorNavbarMenuItemHover,
};

export default colors;
