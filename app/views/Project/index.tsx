import React, { useMemo } from 'react';
import { Switch, Route, useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

import PreloadMessage from '#base/components/PreloadMessage';
import { ProjectContext, ProjectContextInterface } from '#base/context/ProjectContext';
import routes from '#base/configs/routes';

import {
    CurrentProjectQuery,
    CurrentProjectQueryVariables,
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

interface Props {
    className?: string;
}

// TODO:
// 1. Set currently active project
// 2. Get currently active project or top user project at root
// 3. Move project context to Init
function Project(props: Props) {
    const { className } = props;
    const { projectId } = useParams<{ projectId: string }>();

    const variables = useMemo(
        (): CurrentProjectQueryVariables => ({
            id: projectId,
        }),
        [projectId],
    );

    const { data, loading, error } = useQuery<CurrentProjectQuery, CurrentProjectQueryVariables>(
        CURRENT_PROJECT,
        { variables },
    );

    const project = data?.project;

    const projectContext: ProjectContextInterface = useMemo(
        () => ({
            project: project ?? undefined,
            // create a map of user permissions
        }),
        [project],
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

    /*
     * NOTE: styling for view is located in
     * `/configs/routes/styles.css`
     */
    return (
        <ProjectContext.Provider value={projectContext}>
            <Switch>
                <Route
                    exact
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
        </ProjectContext.Provider>
    );
}

export default Project;
