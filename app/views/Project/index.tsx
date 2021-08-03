import React, { useMemo, useContext } from 'react';
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

    const { setProject } = useContext(ProjectContext);

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
            },
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

    if (loading) {
        return (
            <PreloadMessage
                className={className}
                content="Checking project permissions..."
            />
        );
    }

    return (
        <Switch>
            <Route
                path={routes.tagging.path}
                render={routes.tagging.load}
            />
            <Route
                exact
                path={routes.analysis.path}
                render={routes.analysis.load}
            />
            <Route
                exact
                path={routes.fourHundredFour.path}
                render={routes.fourHundredFour.load}
            />
        </Switch>
    );
}

export default Project;
