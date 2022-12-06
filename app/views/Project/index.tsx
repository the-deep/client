import React, {
    useMemo,
    useContext,
    Suspense,
    useCallback,
    useState,
} from 'react';
import { Switch, Route, useParams } from 'react-router-dom';
import { useQuery, gql, useMutation } from '@apollo/client';
import {
    Button,
} from '@the-deep/deep-ui';

import PreloadMessage from '#base/components/PreloadMessage';
import { ProjectContext } from '#base/context/ProjectContext';
import routes from '#base/configs/routes';
import FullPageErrorMessage from '#views/FullPageErrorMessage';
import { useModalState } from '#hooks/stateManagement';
import ProjectJoinModal from '#components/general/ProjectJoinModal';

import {
    CurrentProjectQuery,
    CurrentProjectQueryVariables,
    SetLastActiveProjectMutation,
    SetLastActiveProjectMutationVariables,
} from '#generated/types';
import { LAST_ACTIVE_PROJECT_FRAGMENT } from '#gqlFragments';

const CURRENT_PROJECT = gql`
    ${LAST_ACTIVE_PROJECT_FRAGMENT}
    query CurrentProject($id: ID!) {
        project(id: $id) {
            ...LastActiveProjectResponse
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

    const [
        showProjectJoinModal,
        setModalVisible,
        setModalHidden,
    ] = useModalState(false);

    const [joinButtonVisible, setJoinButtonVisibility] = useState(true);

    const handleJoinRequestSuccess = useCallback(() => {
        setJoinButtonVisibility(false);
    }, []);

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
    const {
        loading,
        error,
        data: fetchedProject,
    } = useQuery<CurrentProjectQuery, CurrentProjectQueryVariables>(
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
            <>
                <FullPageErrorMessage
                    className={className}
                    errorTitle="Oh no!"
                    errorMessage={(
                        <div>
                            You do not have permission to access this page.
                            {fetchedProject?.project?.membershipPending && (
                                <div>
                                    Your request to join the project is
                                    pending approval from admins of the project.
                                </div>
                            )}
                        </div>
                    )}
                    krakenVariant="hi"
                    buttons={(
                        projectId
                        && !fetchedProject?.project?.membershipPending
                        && !fetchedProject?.project?.isRejected
                        && joinButtonVisible
                    ) && (
                        <Button
                            name={undefined}
                            onClick={setModalVisible}
                        >
                            Request to join project
                        </Button>
                    )}
                />
                {showProjectJoinModal && (
                    <ProjectJoinModal
                        projectId={projectId}
                        onModalClose={setModalHidden}
                        onJoinRequestSuccess={handleJoinRequestSuccess}
                    />
                )}
            </>
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
                    path={routes.exportCreate.path}
                >
                    {routes.exportCreate.load({ className })}
                </Route>
                <Route
                    path={routes.assessmentExportCreate.path}
                >
                    {routes.assessmentExportCreate.load({ className })}
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
