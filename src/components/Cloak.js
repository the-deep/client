import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    activeUserSelector,
    currentUserProjectsSelector,
    activeProjectFromStateSelector,
    routePathKeySelector,
} from '#redux';

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
    userProjects: currentUserProjectsSelector(state),
    currentUserActiveProject: activeProjectFromStateSelector(state),
    routePathKey: routePathKeySelector(state),
});

const propTypes = {
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
    renderOnCloak: PropTypes.func,

    disable: PropTypes.func,
    hide: PropTypes.func,
};

const defaultProps = {
    disable: undefined,
    hide: undefined,

    activeUser: {},
    userProjects: [],

    renderOnCloak: undefined,
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
            renderOnCloak,
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

        const hidden = hide && hide({
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
        });

        if (hidden) {
            return renderOnCloak ? renderOnCloak() : null;
        }

        const disabled = disable && disable({
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
        });
        return <Child disabled={disabled} />;
    }
}
