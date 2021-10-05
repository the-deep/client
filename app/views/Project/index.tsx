import React, { useMemo, useContext, Suspense } from 'react';
import { Switch, Route, useParams } from 'react-router-dom';
import { useQuery, gql, useMutation } from '@apollo/client';

import PreloadMessage from '#base/components/PreloadMessage';
import { ProjectContext } from '#base/context/ProjectContext';
import routes from '#base/configs/routes';

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

    const { loading, error } = useQuery<CurrentProjectQuery, CurrentProjectQueryVariables>(
        CURRENT_PROJECT,
        {
            variables,
            onCompleted: (data) => {
                if (data.project) {
                    setProject(data.project);

                    setLastActiveProject({
                        variables: { id: data.project.id },
                    });
                }
                // FIXME: handle failure
            },
            // FIXME: handle failure
        },
    );

    if (error) {
        return (
            <PreloadMessage
                className={className}
                heading="Oh no!"
                content="Some error occurred"
            />
        );
    }

    const inconsistent = project && projectId !== project.id;

    if (loading || inconsistent) {
        return (
            <PreloadMessage
                className={className}
                content="Checking project permissions..."
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
                    path={routes.projectEdit.path}
                >
                    {routes.projectEdit.load({ className })}
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

export default Project;
