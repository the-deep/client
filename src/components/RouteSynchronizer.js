import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import Bundle from '#rscg/Bundle';
import withTracker from '#rscg/withTracker';
import {
    reverseRoute,
} from '#rsu/common';

import Cloak from '#components/Cloak';
import { routes } from '#constants/routes';
import viewsAcl from '#constants/viewsAcl';

import {
    activeProjectIdFromStateSelector,
    activeCountryIdFromStateSelector,
    setActiveProjectAction,
    setActiveCountryAction,
    setRouteParamsAction,
} from '#redux';
import _ts from '#ts';


const Page = ({ name, disabled, ...otherProps }) => {
    // NOTE: don't show page if it is disabled as well
    if (disabled) {
        return <PageError />;
    }

    return (
        <Fragment>
            <Helmet>
                <meta charSet="utf-8" />
                <title>
                    { _ts('pageTitle', name) }
                </title>
            </Helmet>
            <Bundle name={name} {...otherProps} />
        </Fragment>
    );
};

const PageError = () => {
    const name = 'fourHundredFour';
    return (
        <Fragment>
            <Helmet>
                <meta charSet="utf-8" />
                <title>
                    { _ts('pageTitle', name) }
                </title>
            </Helmet>
            <Bundle
                load={routes[name].loader}
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

    name: PropTypes.string.isRequired,
};

const defaultProps = {
    activeProjectId: undefined,
    activeCountryId: undefined,
};

const mapStateToProps = state => ({
    activeProjectId: activeProjectIdFromStateSelector(state),
    activeCountryId: activeCountryIdFromStateSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
    setActiveCountry: params => dispatch(setActiveCountryAction(params)),
    setRouteParams: params => dispatch(setRouteParamsAction(params)),
});


@withTracker
@connect(mapStateToProps, mapDispatchToProps)
class RouteSynchronizer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.syncState(props);

        const { match, location } = this.props;
        this.props.setRouteParams({ match, location });
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
        }

        const newUrlParams = this.getNewUrlParams(nextProps);
        if (newUrlParams) {
            this.syncUrl(nextProps, newUrlParams);
        } else {
            this.syncState(nextProps);
        }
    }

    getNewUrlParams = (nextProps) => {
        const {
            activeProjectId: oldProjectId,
            activeCountryId: oldCountryId,
        } = this.props;
        const {
            match: { params },
            activeProjectId: newProjectId,
            activeCountryId: newCountryId,
        } = nextProps;
        const {
            projectId,
            countryId,
        } = params;

        const changed = (
            (projectId && oldProjectId !== newProjectId) ||
            (countryId && oldCountryId !== newCountryId)
        );

        if (!changed) {
            return undefined;
        }
        return {
            ...params,
            projectId: newProjectId,
            countryId: newCountryId,
        };
    };

    syncUrl = (nextProps, newUrlParams) => {
        const { history, match: { path } } = nextProps;
        const { location } = this.props;
        const newPath = reverseRoute(path, newUrlParams);

        if (newPath === this.props.match.url) {
            console.warn('No need to sync url');
            return;
        }

        if (location.hash === nextProps.location.hash) {
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
            console.warn('Syncing state: projectId');
            newProps.setActiveProject({ activeProject: +newMatchProjectId });
        }
        if (newMatchCountryId && oldActiveCountryId !== +newMatchCountryId) {
            console.warn('Syncing state: countryId');
            newProps.setActiveCountry({ activeCountry: +newMatchCountryId });
        }
    }

    render() {
        const {
            name,
            match, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;
        return (
            <Cloak
                {...viewsAcl[name]}
                render={
                    <Page
                        name={name}
                        {...otherProps}
                    />
                }
                renderOnHide={<PageError />}
            />
        );
    }
}

export default RouteSynchronizer;
