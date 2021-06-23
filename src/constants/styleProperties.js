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
        colorBackgroundScrollbar: 'transparent',

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

        radiusScrollbarBorder: '0.25rem',

        heightWidgetHeader: '20px',

        // We do not use variable name extreme
        fontSizeExtremeLarge: '32px',
    },
};

export default styleProperties;
