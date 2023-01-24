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
                    path={routes.documentViewer.path}
                >
                    {routes.documentViewer.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.extensionPrivacyPolicy.path}
                >
                    {routes.extensionPrivacyPolicy.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.termsOfService.path}
                >
                    {routes.termsOfService.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.login.path}
                >
                    {routes.login.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.register.path}
                >
                    {routes.register.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.forgotPassword.path}
                >
                    {routes.forgotPassword.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.resetPassword.path}
                >
                    {routes.resetPassword.load({ className })}
                </Route>
                <Route
                    path={routes.entryEditRedirect.path}
                >
                    {routes.entryEditRedirect.load({ className })}
                </Route>
                <Route
                    path={routes.documentViewerRedirect.path}
                >
                    {routes.documentViewerRedirect.load({ className })}
                </Route>
                <Route
                    path={routes.projectRedirect.path}
                >
                    {routes.projectRedirect.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.fourHundredFour.path}
                >
                    {routes.fourHundredFour.load({})}
                </Route>
            </Switch>
        </Suspense>
    );
}
export default Routes;
