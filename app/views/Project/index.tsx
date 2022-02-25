import React, { useMemo, useContext, Suspense } from 'react';
import { Switch, Route, useParams } from 'react-router-dom';
import { useQuery, gql, useMutation } from '@apollo/client';

import PreloadMessage from '#base/components/PreloadMessage';
import { ProjectContext } from '#base/context/ProjectContext';
import routes from '#base/configs/routes';
import FullPageErrorMessage from '#views/FullPageErrorMessage';

import {
    CurrentProjectQuery,
    CurrentProjectQueryVariables,
    SetLastActiveProjectMutation,
    SetLastActiveProjectMutationVariables,
} from '#generated/types';

const CURRENT_PROJECT = gql`
    query CurrentProject($id: ID!) {
        project(id: $id) {
            allowedPermissions
            currentUserRole
            analysisFramework {
                id
            }
            hasAssessmentTemplate
            id
            isPrivate
            title
            isVisualizationEnabled
            isVisualizationAvailable
        }
    }
`;

const SET_LAST_ACTIVE_PROJECT = gql`
    mutation SetLastActiveProject($id: ID!){
        updateMe(data: {lastActiveProject: $id}) {
            ok
            errors
        }
    }
`;

interface Props {
    className?: string;
}

function Project(props: Props) {
    const { className } = props;
    const { projectId } = useParams<{ projectId: string }>();

    const { project, setProject } = useContext(ProjectContext);

    const variables = useMemo(
        (): CurrentProjectQueryVariables => ({
            id: projectId,
        }),
        [projectId],
    );

    // eslint-disable-next-line max-len
    const [setLastActiveProject] = useMutation<SetLastActiveProjectMutation, SetLastActiveProjectMutationVariables>(
        SET_LAST_ACTIVE_PROJECT,
    );

    // Let's make sure last active project
    const { loading, error } = useQuery<CurrentProjectQuery, CurrentProjectQueryVariables>(
        CURRENT_PROJECT,
        {
            variables,
            onCompleted: (data) => {
                if (
                    data.project
                    && data.project.allowedPermissions?.length > 0
                ) {
                    setProject(data.project);

                    setLastActiveProject({
                        variables: { id: data.project.id },
                    });
                }
            },
        },
    );

    if (error) {
        return (
            <FullPageErrorMessage
                className={className}
                errorTitle="Oh no!"
                errorMessage="Some error occured"
                krakenVariant="hi"
            />
        );
    }

    // NOTE: `loading` is set to `true` randomly which dismounts all the
    // children below so, only show loading if
    // - there is no project
    // - or projectId has changed
    // - and loading is set
    const wait = !project || project.id !== projectId;
    if (wait) {
        if (loading) {
            return (
                <PreloadMessage
                    className={className}
                    content="Checking project permissions..."
                />
            );
        }
        // NOTE: This branch will be called when user requests project without
        // any permissions
        return (
            <FullPageErrorMessage
                className={className}
                errorTitle="Oh no!"
                errorMessage="You do not have permission to access this page"
                krakenVariant="hi"
            />
        );
    }

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
                    path={routes.entryEdit.path}
                >
                    {routes.entryEdit.load({ className })}
                </Route>
                <Route
                    path={routes.tagging.path}
                >
                    {routes.tagging.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.analysis.path}
                >
                    {routes.analysis.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.pillarAnalysis.path}
                >
                    {routes.pillarAnalysis.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.assessmentEdit.path}
                >
                    {routes.assessmentEdit.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.groupAssessmentEdit.path}
                >
                    {routes.groupAssessmentEdit.load({ className })}
                </Route>
                <Route
                    path={routes.projectEdit.path}
                >
                    {routes.projectEdit.load({ className })}
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

export default Project;
