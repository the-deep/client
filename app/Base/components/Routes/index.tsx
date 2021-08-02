import React from 'react';
import { Switch, Route } from 'react-router-dom';

import routes from '#base/configs/routes';

function Routes() {
    return (
        <Switch>
            <Route
                exact
                path={routes.home.path}
                render={routes.home.load}
            />
            <Route
                exact
                path={routes.explore.path}
                render={routes.explore.load}
            />
            <Route
                path={routes.project.path}
                render={routes.project.load}
            />
            <Route
                exact
                path={routes.signIn.path}
                render={routes.signIn.load}
            />
            <Route
                exact
                path={routes.signUp.path}
                render={routes.signUp.load}
            />
            <Route
                exact
                path={routes.forgetPassword.path}
                render={routes.forgetPassword.load}
            />
            <Route
                exact
                path={routes.resetPassword.path}
                render={routes.resetPassword.load}
            />
            <Route
                exact
                path={routes.fourHundredFour.path}
                render={routes.fourHundredFour.load}
            />
        </Switch>
    );
}
export default Routes;
