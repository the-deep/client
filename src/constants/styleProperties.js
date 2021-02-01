import defaultColors from '#rsu/styles/default/colors';

const styleProperties = {
    colors: {
        colorSeparatorOnNavbar: defaultColors.colorSeparator,
        colorSeparatorHoverOnNavbar: defaultColors.colorSeparatorHover,
        colorNavbarActiveMenuItemBorder: defaultColors.colorAccent,
        colorNavbarActiveMenuItem: defaultColors.colorAccent,
        colorNavbarMenuItemHover: defaultColors.colorAccent,
        colorBackgroundPrimaryHint: '#ecf3fa',
        colorHighlight: '#ffff8d',
        colorLink: '#187bcd',
        colorTextSuccess: '#43a047',
        colorTextOnHightlight: defaultColors.colorTextOnLight,
        colorTextOnDark: '#fff',
        colorShadowLight: 'rgba(0, 0, 0, .1)',
        colorSelectedGroup: '#f0f0f0',
        colorSelectedGroupHatch: 'rgba(0, 0, 0, 0.4)',
        colorBackgroundReadNotification: '#f5f5f5',
        colorBackgroundDangerHint: '#fffafa',

        duiColorBlack: '#000000',
        duiColorGrey1: '#333333',
        duiColorGrey2: '#4f4f4f',
        duiColorGrey3: '#828282',
        duiColorGrey4: '#bdbdbd',
        duiColorGrey5: '#e0e0e0',
        duiColorGrey6: '#f2f2f2',
        duiColorWhite: '#ffffff',

        duiColorBrand: '#00125b',
        duiColorAccent: '#1a3ed0',
        duiColorAccentHover: '#1030b2',
        duiColorTextOnAccent: '#ffffff',

        duiColorBackgroundPrimaryButton: 'var(--dui-color-accent)',
        duiColorBackgroundHoverPrimaryButton: 'var(--dui-color-accent-hover)',
        duiColorTextPrimaryButton: 'var(--dui-color-text-on-accent)',

        duiColorBackgroundTertiaryHover: '#f5f8fb',

        duiColorComplement1: '#008eff',
        duiColorComplement2: '#00c9f0',
        duiColorComplement3: '#ffb443',

        duiColorPositive: '#29bb75',
        duiColorInformation: '#3fa2f7',
        duiColorNegative: '#ff5c52',

        duiColorBackground: '#f6f6f6',
        duiColorBackgroundInformation: '#3fa2f7',
        duiColorBackgroundNegative: '#ff5c52',

        duiColorText: 'var(--dui-color-grey1)',

        duiColorBackgroundDisabled: 'var(--dui-color-grey5)',
        duiColorTextDisabled: 'var(--dui-color-grey4)',
    },

    dimens: {
        widthEditFrameworkModal: '860px',
        widthSearchInput: '214px',
        minHeightSearchInput: '88px',
        maxHeightSearchInput: '280px',
        widthUserItemPicture: '30px',
        heightUserItemPicture: '30px',
        widthErrorPaneStringManagement: '320px',

        widthConnectorTestModal: '96vw',
        heightConnectorTestModal: '96vh',

        entryCommentMaxHeightCommentHistory: '60vh',
        entryCommentDropdownWidth: '96px',
        entryCommentModalMaxHeight: '80vh',
        entryCommentModalWidth: '480px',

        entryGroupModalMaxHeight: '60vh',
        entryGroupModalMaxWidth: '60vw',
        entryGroupModalMinWidth: '360px',

        widthModalLarge: '80vw',
        heightModalMedium: '70vh',

        heightEntryLabelCard: '144px',
        widthEntryLabelCard: '320px',

        widthTableCheckbox: '56px',
        widthTableDateTime: '120px',
        widthTableIcon: '56px',

        widthScrollbar: '8px',

        heightMatrixHeader: '20px',

        widthProjectDetailLeftPane: '280px',
        widthQuestionIcon: '48px',
        heightQuestionIcon: '48px',
        heightNagbar: '64px',

        heightActionBar: '42px',

        duiSpacingExtraSmall: '0.1rem',
        duiSpacingSmall: '0.2rem',
        duiSpacingMedium: '0.45rem',
        duiSpacingLarge: '0.66rem',
        duiSpacingExtraLarge: '1.1rem',

        duiFontSizeSmall: '0.67rem',
        duiFontSizeMedium: '0.86rem',
        duiFontSizeLarge: '1rem',

        duiFontWeightLight: '300',
        duiFontWeightMedium: '400',
        duiFontWeightBold: '700',

        duiWidthSeparatorThin: '0.06em',
        duiWidthSeparatorMedium: '0.1em',
    },
};

export default styleProperties;

export const convertToNumber = value => value.substring(0, value.length - 2);
