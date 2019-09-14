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
        colorTextSuccess: '#43a047',
        colorTextOnHightlight: defaultColors.colorTextOnLight,
        colorShadowLight: 'rgba(0, 0, 0, .1)',
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
        entryCommentModalWidth: '360px',
    },
};

export default styleProperties;

export const convertToNumber = value => value.substring(0, value.length - 2);
