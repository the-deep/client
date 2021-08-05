import React from 'react';
import { Switch, Route } from 'react-router-dom';

import routes from '#base/configs/routes';

function Routes() {
    return (
        <Switch>
            <Route
                exact
                path={routes.home.path}
            >
                {routes.home.load({})}
            </Route>
            <Route
                exact
                path={routes.explore.path}
            >
                {routes.explore.load({})}
            </Route>
            <Route
                path={routes.project.path}
            >
                {routes.project.load({})}
            </Route>
            <Route
                exact
                path={routes.signIn.path}
            >
                {routes.signIn.load({})}
            </Route>
            <Route
                exact
                path={routes.signUp.path}
            >
                {routes.signUp.load({})}
            </Route>
            <Route
                exact
                path={routes.forgetPassword.path}
            >
                {routes.forgetPassword.load}
            </Route>
            <Route
                exact
                path={routes.resetPassword.path}
            >
                {routes.resetPassword.load({})}
            </Route>
            <Route
                exact
                path={routes.fourHundredFour.path}
            >
                {routes.fourHundredFour.load({})}
            </Route>
        </Switch>
    );
}
export default Routes;
