import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PreloadMessage from '#base/components/PreloadMessage';

import routes from '#base/configs/routes';

interface Props {
    className?: string;
}

function MyRoutes(props: Props) {
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
            <Routes>
                <Route
                    path={routes.home.pathForRoute}
                    element={routes.home.load({ className })}
                />
                <Route
                    path={routes.myProfile.pathForRoute}
                    element={routes.myProfile.load({ className })}
                />
                <Route
                    path={routes.userGroups.pathForRoute}
                    element={routes.userGroups.load({ className })}
                />
                <Route
                    path={routes.explore.pathForRoute}
                    element={routes.explore.load({ className })}
                />
                <Route
                    path={routes.projectCreate.pathForRoute}
                    element={routes.projectCreate.load({ className })}
                />
                <Route
                    path={routes.project.pathForRoute}
                    element={routes.project.load({ className })}
                />
                <Route
                    path={routes.analyticalFrameworkEdit.pathForRoute}
                    element={routes.analyticalFrameworkEdit.load({ className })}
                />
                <Route
                    path={routes.analyticalFrameworkCreate.pathForRoute}
                    element={routes.analyticalFrameworkCreate.load({ className })}
                />
                <Route
                    path={routes.login.pathForRoute}
                    element={routes.login.load({ className })}
                />
                <Route
                    path={routes.register.pathForRoute}
                    element={routes.register.load({ className })}
                />
                <Route
                    path={routes.forgotPassword.pathForRoute}
                    element={routes.forgotPassword.load({ className })}
                />
                <Route
                    path={routes.resetPassword.pathForRoute}
                    element={routes.resetPassword.load({ className })}
                />
                <Route
                    path={routes.fourHundredFour.pathForRoute}
                    element={routes.fourHundredFour.load({})}
                />
            </Routes>
        </Suspense>
    );
}
export default MyRoutes;
