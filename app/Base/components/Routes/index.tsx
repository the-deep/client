import React, { Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';
import PreloadMessage from '#base/components/PreloadMessage';

import routes from '#base/configs/routes';

interface Props {
    className?: string;
}

function Routes(props: Props) {
    const { className } = props;

    return (
        <Suspense
            fallback={(
                <PreloadMessage
                    className={className}
                    content="Loading page..."
                />
            )}
        >
            <Switch>
                <Route
                    exact
                    path={routes.home.path}
                >
                    {routes.home.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.myProfile.path}
                >
                    {routes.myProfile.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.userGroups.path}
                >
                    {routes.userGroups.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.explore.path}
                >
                    {routes.explore.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.projectCreate.path}
                >
                    {routes.projectCreate.load({ className })}
                </Route>
                <Route
                    path={routes.project.path}
                >
                    {routes.project.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.analyticalFrameworkEdit.path}
                >
                    {routes.analyticalFrameworkEdit.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.analyticalFrameworkCreate.path}
                >
                    {routes.analyticalFrameworkCreate.load({ className })}
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
        </Suspense>
    );
}
export default Routes;
