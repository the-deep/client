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
        colorAccentOnHover: '#008975cc',

        duiColorSurfaceInformational: '#f5f8fb',
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
        heightSubNavbar: '48px',

        heightActionBar: '42px',

        fontSizeSuperSmall: '0.5rem',
        fontSizeSuperSmallAlt: '0.58rem',
        fontSizeExtraSmall: '0.64rem',
        fontSizeExtraSmallAlt: '0.69rem',
        fontSizeSmall: '0.74rem',
        fontSizeSmallAlt: '0.81rem',
        fontSizeMedium: '0.87rem',
        fontSizeMediumAlt: '0.97rem',
        fontSizeLarge: '1.1rem',
        fontSizeLargeAlt: '1.3rem',
        fontSizeExtraLarge: '1.57rem',
        fontSizeExtraLargeAlt: '1.9rem',
        fontSizeSuperLarge: '2.2rem',
        fontSizeSuperLargeAlt: '2.8rem',
        fontSizeMegaLarge: '3.4rem',
        fontSizeMegaAlt: '4.1rem',
        fontSizeUltraLarge: '4.7rem',
        fontSizeUltraLargeAlt: '6.1rem',

        // We do not use variable name extreme
        fontSizeExtremeLarge: '32px',

        spacingSuperSmall: '0.14rem',
        spacingExtraSmall: '0.26rem',
        spacingExtraSmallAlt: '0.33rem',
        spacingSmall: '0.41rem',
        spacingSmallAlt: '0.523rem',
        spacingMedium: '0.79rem',
        spacingMediumAlt: '0.933rem',
        spacingLarge: '1.17rem',
        spacingLargeAlt: '1.36rem',
        spacingExtraLarge: '1.83rem',
        spacingExtraLargeAlt: '2.46rem',
        spacingSuperLarge: '3.01rem',
        spacingSuperLargeAlt: '3.81rem',
        spacingMegaLarge: '4.81rem',
        spacingUltraLarge: '6.89rem',
    },
};

export default styleProperties;

export const convertToNumber = value => value.substring(0, value.length - 2);
