import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import boundError from '#rscg/BoundError';
import Bundle from '#rscg/Bundle';
import withTracker from '#rscg/withTracker';
import {
    isParamRequired,
    reverseRoute,
} from '#rsu/common';

import AppError from '#components/AppError';
import Cloak from '#components/Cloak';
import { routes } from '#constants/routes';
import viewsAcl from '#constants/viewsAcl';

import {
    getDefaultTabId,
    activeProjectIdFromStateSelector,
    activeCountryIdFromStateSelector,
    tabsByCurrentUrlSelector,
    setActiveProjectAction,
    setActiveCountryAction,
    setRouteParamsAction,
    activeProjectRoleSelector,
    setTabStatusAction,
} from '#redux';
import _ts from '#ts';

const ErrorBoundBundle = boundError(AppError)(Bundle);

const PageError = ({ noProjectPermission }) => {
    const name = noProjectPermission
        ? 'projectDenied'
        : 'fourHundredThree';

    return (
        <Fragment>
            <Helmet>
                <meta charSet="utf-8" />
                <title>
                    { _ts('pageTitle', name) }
                </title>
            </Helmet>
            <ErrorBoundBundle
                key={name}
                load={routes[name].loader}
            />
        </Fragment>
    );
};
PageError.propTypes = {
    noProjectPermission: PropTypes.bool,
};
PageError.defaultProps = {
    noProjectPermission: false,
};

const Page = ({ name, disabled, noProjectPermission, ...otherProps }) => {
    // NOTE: don't show page if it is disabled as well
    if (disabled) {
        return <PageError noProjectPermission={noProjectPermission} />;
    }

    return (
        <Fragment>
            <Helmet>
                <meta charSet="utf-8" />
                <title>
                    { _ts('pageTitle', name) }
                </title>
            </Helmet>
            <ErrorBoundBundle
                {...otherProps}
                name={name}
                key={name}
            />
        </Fragment>
    );
};

const propTypes = {
    match: PropTypes.shape({
        location: PropTypes.string,
        params: PropTypes.shape({
            dummy: PropTypes.string,
        }),
        url: PropTypes.string,
    }).isRequired,

    history: PropTypes.shape({
        push: PropTypes.func,
    }).isRequired,

    location: PropTypes.shape({
        pathname: PropTypes.string,
    }).isRequired,

    activeProjectId: PropTypes.number,
    activeCountryId: PropTypes.number,
    setRouteParams: PropTypes.func.isRequired,
    setTabStatus: PropTypes.func.isRequired,

    name: PropTypes.string.isRequired,
    path: PropTypes.string,

    projectRole: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    activeProjectId: undefined,
    activeCountryId: undefined,
    projectRole: {},
    path: '',
};

const mapStateToProps = (state, props) => ({
    projectRole: activeProjectRoleSelector(state),
    activeProjectId: activeProjectIdFromStateSelector(state),
    activeCountryId: activeCountryIdFromStateSelector(state),
    tabsByCurrentUrl: tabsByCurrentUrlSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
    setActiveCountry: params => dispatch(setActiveCountryAction(params)),
    setRouteParams: params => dispatch(setRouteParamsAction(params)),
    setTabStatus: params => dispatch(setTabStatusAction(params)),
});


@withTracker
@connect(mapStateToProps, mapDispatchToProps)
class RouteSynchronizer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.syncState(props);
    }

    componentDidMount() {
        const { match, location, setTabStatus } = this.props;
        this.props.setRouteParams({
            match,
            location,
        });

        // Done at DidMount and not constructor because we want
        // to make sure that the silo tasks for setting tab status timestamp
        // has been started at this point.
        setTabStatus({
            url: match.url,
            path: match.path,
        });
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.match !== nextProps.match ||
            this.props.location !== nextProps.location
        ) {
            this.props.setRouteParams({
                match: nextProps.match,
                location: nextProps.location,
            });
            this.props.setTabStatus({
                url: nextProps.match.url,
                path: nextProps.match.path,
            });
        } else if (!nextProps.tabsByCurrentUrl.includes(getDefaultTabId())) {
            // If for some inconsistent timing, current tab status is lost
            // from redux, reset it.
            // This can happen when the pages are loading in different tabs
            // and time tracking is slowed down by few milliseconds.
            this.props.setTabStatus({
                url: nextProps.match.url,
                path: nextProps.match.path,
            });
        }

        const {
            activeProjectId: oldProjectId,
            activeCountryId: oldCountryId,
        } = this.props;
        const {
            match: { params },
            activeProjectId: newProjectId,
            activeCountryId: newCountryId,
        } = nextProps;

        const newUrlParams = this.getNewUrlParams(
            oldProjectId,
            oldCountryId,
            newProjectId,
            newCountryId,
        );

        if (newUrlParams) {
            this.syncUrl(nextProps, { ...params, ...newUrlParams });
        } else {
            this.syncState(nextProps);
        }
    }

    getNewUrlParams = memoize((oldProjectId, oldCountryId, newProjectId, newCountryId) => {
        const changed = (
            (oldProjectId !== newProjectId) ||
            (oldCountryId !== newCountryId)
        );
        if (!changed) {
            return undefined;
        }

        return {
            projectId: newProjectId,
            countryId: newCountryId,
        };
    });

    syncUrl = (nextProps, newUrlParams) => {
        const { history, match: { path }, location: { hash } } = nextProps;
        const { location } = this.props;
        const newPath = reverseRoute(path, newUrlParams);

        if (newPath === this.props.match.url) {
            console.warn('No need to sync url');
            return;
        }

        if (location.hash === hash) {
            history.push({
                ...location,
                pathname: newPath,
            });
        }

        history.replace({
            ...location,
            pathname: newPath,
        });
    }

    syncState = (newProps) => {
        const {
            activeProjectId: oldActiveProjectId,
            activeCountryId: oldActiveCountryId,
            match: { params: oldMatchParams },
        } = this.props;

        const {
            match: {
                path: newMatchPath,
                url: newMatchUrl,
                params: {
                    projectId: newMatchProjectId,
                    countryId: newMatchCountryId,
                },
            },
        } = newProps;

        const oldLocation = reverseRoute(
            newMatchPath,
            {
                ...oldMatchParams,
                projectId: oldActiveProjectId,
                countryId: oldActiveCountryId,
            },
        );
        if (oldLocation === newMatchUrl) {
            return;
        }

        if (newMatchProjectId && oldActiveProjectId !== +newMatchProjectId) {
            console.warn('Syncing state: projectId', +newMatchProjectId);
            newProps.setActiveProject({ activeProject: +newMatchProjectId });
        }
        if (newMatchCountryId && oldActiveCountryId !== +newMatchCountryId) {
            console.warn('Syncing state: countryId', +newMatchCountryId);
            newProps.setActiveCountry({ activeCountry: +newMatchCountryId });
        }
    }

    render() {
        const {
            name,
            match, // eslint-disable-line no-unused-vars
            path,
            projectRole,
            tabsByCurrentUrl,
            ...otherProps
        } = this.props;

        const {
            setupPermissions = {},
        } = projectRole;

        // FIXME: do not depend on selectors using state
        const noProjectPermission = isParamRequired(path, 'projectId') && !setupPermissions.view;

        if (!viewsAcl[name]) {
            console.warn('No access control for view', name);
        }

        if (tabsByCurrentUrl.length > 1) {
            console.warn('Another tab is opened at this same URL');
        }

        return (
            <Cloak
                {...viewsAcl[name]}
                render={
                    <Page
                        name={name}
                        noProjectPermission={noProjectPermission}
                        {...otherProps}
                    />
                }
                renderOnHide={
                    <PageError noProjectPermission={noProjectPermission} />
                }
            />
        );
    }
}

export default RouteSynchronizer;
