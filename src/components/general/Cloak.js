import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import { mapToMap } from '@togglecorp/fujs';
import featuresMapping from '#constants/features';

import {
    activeUserSelector,
    currentUserProjectsSelector,
    activeProjectFromStateSelector,
    routePathKeySelector,
    activeProjectRoleSelector,
} from '#redux';

import { isDev, isAlpha, isStaging, isBeta, isNightly } from '#config/env';

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
        isSuperuser: PropTypes.bool,
        accessibleFeatures: PropTypes.array, // eslint-disable-line react/forbid-prop-types
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
    accessZoomableImage: featureList => featureList.includes(featuresMapping.zoomableImage),
    accessPrivateProject: featureList => featureList.includes(featuresMapping.privateProject),
    accessQuestionnaire: featureList => featureList.includes(featuresMapping.questionnaire),
    accessNewUi: featureList => featureList.includes(featuresMapping.newUi),
    accessAnalysisModule: featureList => featureList.includes(featuresMapping.analysisModule),
    accessEntryVisualizationConfiguration: featureList =>
        featureList.includes(featuresMapping.entryVizConfig),
};

@connect(mapStateToProps, undefined)
export default class Cloak extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getAccessibleFeatures = memoize((accessibleFeatures = []) => {
        const featureList = accessibleFeatures.map(f => f.key);

        const features = mapToMap(
            allAccessibleFeatures,
            k => k,
            v => v(featureList),
        );
        return features;
    });

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

        const {
            accessibleFeatures,
            userId: activeUserId,
            isSuperuser,
        } = activeUser;

        const isLoggedIn = !!activeUserId;
        const isAdmin = isSuperuser;

        const hasProjects = userProjects.length > 0;
        const hasAssessmentTemplate = !!currentUserActiveProject.assessmentTemplate;
        const hasAnalysisFramework = !!currentUserActiveProject.analysisFramework;
        const pathKey = routePathKey;

        const {
            accessZoomableImage,
            accessPrivateProject,
            accessEntryVisualizationConfiguration,
            accessQuestionnaire,
            accessNewUi,
            accessAnalysisModule,
        } = this.getAccessibleFeatures(accessibleFeatures);

        const params = {
            isDevMode: isDev,
            isBeta,
            isAlpha,
            isStaging,
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

            accessZoomableImage,
            accessPrivateProject,
            accessQuestionnaire,
            accessNewUi,
            accessAnalysisModule,
            accessEntryVisualizationConfiguration,
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
