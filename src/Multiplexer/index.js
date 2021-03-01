import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Switch,
    Route,
    withRouter,
} from 'react-router-dom';
import { connect } from 'react-redux';
import {
    _cs,
    isDefined,
    getFirstKeyByValue,
} from '@togglecorp/fujs';

import ExclusivelyPublicRoute from '#rscg/ExclusivelyPublicRoute';
import PrivateRoute from '#rscg/PrivateRoute';
import Toast from '#rscv/Toast';

import RouteSynchronizer from '#components/general/RouteSynchronizer';
import NavbarContext from '#components/NavbarContext';
import Navbar from '#components/general/Navbar';

import { mapObjectToObject } from '#utils/common';
import BrowserWarning from '#components/general/BrowserWarning';

import {
    pathNames,
    routesOrder,
    routes,
    getCurrentMatch,
    showSubNavbar,
} from '#constants';

import { setTheme } from '#theme';

import {
    authenticatedSelector,
    lastNotifySelector,
    notifyHideAction,
    currentThemeIdSelector,
} from '#redux';

import styles from './styles.scss';

const ROUTE = {
    exclusivelyPublic: 'exclusively-public',
    public: 'public',
    private: 'private',
};

const propTypes = {
    authenticated: PropTypes.bool.isRequired,
    lastNotify: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    notifyHide: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    currentThemeId: currentThemeIdSelector(state),
    authenticated: authenticatedSelector(state),
    lastNotify: lastNotifySelector(state),
});

const mapDispatchToProps = dispatch => ({
    notifyHide: params => dispatch(notifyHideAction(params)),
});


const views = mapObjectToObject(
    routes,
    (route, name) => props => (
        <RouteSynchronizer
            {...props}
            load={route.loader}
            path={route.path}
            name={name}
        />
    ),
);

// NOTE: withRouter is required here so that link change are updated
function Multiplexer(props) {
    const {
        currentThemeId,
        lastNotify,
        notifyHide,
        authenticated,
        location,
    } = props;

    useEffect(() => {
        setTheme(currentThemeId);
    }, [currentThemeId]);

    const handleToastClose = useCallback(() => {
        notifyHide();
    }, [notifyHide]);

    const renderRoute = useCallback((routeId) => {
        const view = views[routeId];
        if (!view) {
            console.error(`Cannot find view associated with routeID: ${routeId}`);
            return null;
        }

        const path = pathNames[routeId];
        const { redirectTo, type } = routes[routeId];

        switch (type) {
            case ROUTE.exclusivelyPublic:
                return (
                    <ExclusivelyPublicRoute
                        component={view}
                        key={routeId}
                        path={path}
                        exact
                        authenticated={authenticated}
                        redirectLink={redirectTo}
                    />
                );
            case ROUTE.private:
                return (
                    <PrivateRoute
                        component={view}
                        key={routeId}
                        path={path}
                        exact
                        authenticated={authenticated}
                        redirectLink={redirectTo}
                    />
                );
            case ROUTE.public:
                return (
                    <Route
                        component={view}
                        key={routeId}
                        path={path}
                        exact
                    />
                );
            default:
                console.error(`Invalid route type ${type}`);
                return null;
        }
    }, [authenticated]);

    const [parentNode, setParentNode] = useState(null);
    const currentMatch = useMemo(() => getCurrentMatch(location), [location]);

    const currentPath = useMemo(() => (
        isDefined(currentMatch)
            ? getFirstKeyByValue(pathNames, currentMatch.path) : 'fourHundredFour'
    ), [currentMatch]);

    return (
        <NavbarContext.Provider
            value={{
                parentNode,
                setParentNode,
            }}
        >
            <BrowserWarning />
            <Navbar
                className={_cs(
                    'navbar',
                    showSubNavbar[currentPath] && 'show-sub-navbar',
                )}
            />
            <Toast
                notification={lastNotify}
                onClose={handleToastClose}
            />
            <div
                className={_cs(
                    'deep-main-content',
                    showSubNavbar[currentPath] && 'show-sub-navbar',
                )}
            >
                <Switch>
                    { routesOrder.map(renderRoute) }
                </Switch>
            </div>
        </NavbarContext.Provider>
    );
}

Multiplexer.propTypes = propTypes;

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Multiplexer));
