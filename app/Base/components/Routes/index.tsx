import React from 'react';
import { Switch, Route } from 'react-router-dom';

import routes from '#base/configs/routes';

interface Props {
    className?: string;
}

function Routes(props: Props) {
    const { className } = props;

    return (
        <Switch>
            <Route
                exact
                path={routes.home.path}
            >
                {routes.home.load({ className })}
            </Route>
            <Route
                exact
                path={routes.explore.path}
            >
                {routes.explore.load({ className })}
            </Route>
            <Route
                path={routes.project.path}
            >
                {routes.project.load({ className })}
            </Route>
            <Route
                exact
                path={routes.signIn.path}
            >
                {routes.signIn.load({ className })}
            </Route>
            <Route
                exact
                path={routes.signUp.path}
            >
                {routes.signUp.load({ className })}
            </Route>
            <Route
                exact
                path={routes.forgetPassword.path}
            >
                {routes.forgetPassword.load({ className })}
            </Route>
            <Route
                exact
                path={routes.resetPassword.path}
            >
                {routes.resetPassword.load({ className })}
            </Route>
            <Route
                exact
                path={routes.fourHundredFour.path}
            >
                {routes.fourHundredFour.load({ className })}
            </Route>
        </Switch>
    );
}
export default Routes;
