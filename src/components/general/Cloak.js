import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    activeUserSelector,
    currentUserProjectsSelector,
    activeProjectFromStateSelector,
    routePathKeySelector,
    activeProjectRoleSelector,
} from '#redux';

import { isDev, isAlpha, isBeta, isNightly } from '#config/env';

const mapStateToProps = state => ({
    projectRole: activeProjectRoleSelector(state),
    userProjects: currentUserProjectsSelector(state),

    activeUser: activeUserSelector(state),
    currentUserActiveProject: activeProjectFromStateSelector(state),

    routePathKey: routePathKeySelector(state),
});

const propTypes = {
    projectRole: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
    ),
    routePathKey: PropTypes.string.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    currentUserActiveProject: PropTypes.object.isRequired,
    render: PropTypes.node.isRequired,
    renderOnHide: PropTypes.node,

    disable: PropTypes.func,
    makeReadOnly: PropTypes.func,
    hide: PropTypes.func,
};

const defaultProps = {
    projectRole: {},
    disable: undefined,
    makeReadOnly: undefined,
    hide: undefined,

    activeUser: {},
    userProjects: [],

    renderOnHide: null,
};

const allAccessibleFeatures = {
    accessLeadGridView: featureList => featureList.includes('lead_grid_view'),
    accessZoomableImage: featureList => featureList.includes('zoomable_image'),
    accessTabular: featureList => featureList.includes('tabular'),
    accessPrivateProject: featureList => featureList.includes('private_project'),
};

@connect(mapStateToProps, undefined)
export default class Cloak extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getAccessibleFeatures = (accessibleFeatures) => {
        const features = {};
        const featureList = accessibleFeatures.map(f => f.key);
        Object.keys(allAccessibleFeatures).forEach((f) => {
            features[f] = allAccessibleFeatures[f](featureList);
        });
        return features;
    };

    render() {
        const {
            activeUser,
            userProjects,
            currentUserActiveProject,
            routePathKey,

            disable,
            makeReadOnly,
            hide,

            render: child,
            renderOnHide: anotherChild,
            projectRole: {
                leadPermissions = {},
                entryPermissions = {},
                setupPermissions = {},
                exportPermissions = {},
                assessmentPermissions = {},
            },
        } = this.props;

        const isLoggedIn = !!activeUser.userId;
        const isAdmin = activeUser.isSuperuser;
        const { accessibleFeatures } = activeUser;

        const hasProjects = userProjects.length > 0;
        const hasAssessmentTemplate = !!currentUserActiveProject.assessmentTemplate;
        const hasAnalysisFramework = !!currentUserActiveProject.analysisFramework;
        const pathKey = routePathKey;

        const {
            accessLeadGridView,
            accessZoomableImage,
            accessTabular,
            accessPrivateProject,
        } = this.getAccessibleFeatures(accessibleFeatures);

        const params = {
            isDevMode: isDev,
            isBeta,
            isAlpha,
            isNightly,
            hasProjects,
            isLoggedIn,
            isAdmin,
            hasAssessmentTemplate,
            hasAnalysisFramework,
            pathKey,

            leadPermissions,
            entryPermissions,
            setupPermissions,
            exportPermissions,
            assessmentPermissions,

            accessLeadGridView,
            accessZoomableImage,
            accessTabular,
            accessPrivateProject,
        };

        const hidden = hide && hide(params);
        if (hidden) {
            return anotherChild;
        }

        // NOTE:
        // Should only inject props for which prop to be injected is defined
        const injectionProps = {};

        const shouldBeDisabled = disable && disable(params);
        if (shouldBeDisabled !== undefined) {
            injectionProps.disabled = shouldBeDisabled || !!child.props.disabled;
        }

        const shouldBeReadonly = makeReadOnly && makeReadOnly(params);
        if (shouldBeReadonly !== undefined) {
            injectionProps.readOnly = shouldBeReadonly || !!child.props.readOnly;
        }

        return React.cloneElement(child, injectionProps);
    }
}
