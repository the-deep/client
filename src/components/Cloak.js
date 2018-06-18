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
    requireAdminRights: PropTypes.bool,
    requireProject: PropTypes.bool,
    requireLogin: PropTypes.bool,
    requireDevMode: PropTypes.bool,
    requireAssessmentTemplate: PropTypes.bool,
    requireAnalysisFramework: PropTypes.bool,
    render: PropTypes.func.isRequired,
    renderOnCloak: PropTypes.func,
    disable: PropTypes.func,
    when: PropTypes.bool,
};

const defaultProps = {
    activeUser: {},
    userProjects: [],
    disable: undefined,
    renderOnCloak: undefined,

    requireAdminRights: false,
    requireProject: false,
    requireLogin: false,
    requireDevMode: false,
    requireAssessmentTemplate: false,
    requireAnalysisFramework: false,
    when: false,
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

            requireAdminRights,
            requireProject,
            requireLogin,
            requireDevMode,
            requireAssessmentTemplate,
            requireAnalysisFramework,
            disable,
            when,

            render: Child,
            renderOnCloak,
        } = this.props;

        if (
            when ||
            (requireDevMode && process.env.NODE_ENV !== 'development') ||
            (requireProject && userProjects.length <= 0) ||
            (requireLogin && !activeUser.userId) ||
            (requireAdminRights && !activeUser.isSuperuser) ||
            (requireAssessmentTemplate && !currentUserActiveProject.assessmentTemplate) ||
            (requireAnalysisFramework && !currentUserActiveProject.analysisFramework)
        ) {
            return renderOnCloak ? renderOnCloak() : null;
        }

        const disabled = disable ? disable({ pathKey: routePathKey }) : false;
        return (<Child disabled={disabled} />);
    }
}
