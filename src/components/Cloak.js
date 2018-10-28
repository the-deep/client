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
    render: PropTypes.func.isRequired,
    renderOnHide: PropTypes.func,

    disable: PropTypes.func,
    hide: PropTypes.func,
};

const defaultProps = {
    projectRole: {},
    disable: undefined,
    hide: undefined,

    activeUser: {},
    userProjects: [],

    renderOnHide: undefined,
};

@connect(mapStateToProps, undefined)
export default class Cloak extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            activeUser,
            userProjects,
            currentUserActiveProject,
            routePathKey,

            disable,
            hide,

            render: Child,
            renderOnHide,
            projectRole: {
                leadPermissions = [],
                entryPermissions = [],
                setupPermissions = [],
                exportPermissions = [],
                assessmentPermissions = [],
            },
        } = this.props;

        const isDevMode = process.env.NODE_ENV === 'development';
        const isBeta = process.env.REACT_APP_DEEP_ENVIRONMENT === 'beta';
        const isAlpha = process.env.REACT_APP_DEEP_ENVIRONMENT === 'alpha';
        const isNightly = process.env.REACT_APP_DEEP_ENVIRONMENT === 'nightly';
        const isLoggedIn = !!activeUser.userId;
        const isAdmin = activeUser.isSuperuser;
        const hasProjects = userProjects.length > 0;
        const hasAssessmentTemplate = !!currentUserActiveProject.assessmentTemplate;
        const hasAnalysisFramework = !!currentUserActiveProject.analysisFramework;
        const pathKey = routePathKey;

        const params = {
            isDevMode,
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
        };

        const hidden = hide && hide(params);
        if (hidden) {
            return renderOnHide ? renderOnHide() : null;
        }


        // FIXME: maybe just inject disable value
        const disabled = disable && disable(params);
        return <Child disabled={disabled} />;
    }
}
