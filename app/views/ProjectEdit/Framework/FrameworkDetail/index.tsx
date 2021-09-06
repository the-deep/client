import React, { useMemo, useState, useCallback, useContext } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { generatePath } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import {
    IoCopyOutline,
    IoCheckmark,
} from 'react-icons/io5';
import { FiEdit2 } from 'react-icons/fi';
import {
    Card,
    ConfirmButton,
    Tag,
    List,
    PendingMessage,
    QuickActionLink,
    QuickActionButton,
    ContainerCard,
    Link,
    DateOutput,
    TextOutput,
} from '@the-deep/deep-ui';
import { removeNull } from '@togglecorp/toggle-form';

import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import { useLazyRequest } from '#base/utils/restRequest';
import { ProjectContext } from '#base/context/ProjectContext';
import { useModalState } from '#hooks/stateManagement';
import routes from '#base/configs/routes';
import _ts from '#ts';
import { ProjectDetails } from '#types';
import {
    FrameworkDetailsQuery,
    FrameworkDetailsQueryVariables,
} from '#generated/types';

import AddFrameworkModal from '../AddFrameworkModal';
import styles from './styles.css';

const FRAMEWORK_DETAILS = gql`
    query FrameworkDetails($frameworkId: ID!) {
        analysisFramework(id: $frameworkId) {
            id
            title
            description
            createdAt
            visibleProjects {
                id
                title
            }
            allowedPermissions
            createdBy {
                displayName
            }
            primaryTagging {
                widgets {
                    id
                    clientId
                    key
                    order
                    properties
                    title
                    widgetId
                    width
                }
                clientId
                id
                order
                title
                tooltip
            }
            secondaryTagging {
                clientId
                id
                key
                order
                title
                properties
                widgetId
                width
            }
        }
    }
`;

interface ProjectItem {
    id: string;
    title: string;
}

const itemKeySelector = (d: ProjectItem) => d.id;

interface Props {
    className?: string;
    projectFrameworkId?: string;
    frameworkId: string;
    projectId: string;
    onFrameworkCreate: (newFrameworkId: string) => void;
}

function FrameworkDetail(props: Props) {
    const {
        className,
        projectFrameworkId,
        frameworkId,
        projectId,
        onFrameworkCreate,
    } = props;
    const { setProject } = useContext(ProjectContext);

    const variables = useMemo(
        (): FrameworkDetailsQueryVariables => ({
            frameworkId,
        }),
        [frameworkId],
    );
    const {
        loading: frameworkGetPending,
        data: frameworkDetailsResponse,
    } = useQuery<FrameworkDetailsQuery, FrameworkDetailsQueryVariables>(
        FRAMEWORK_DETAILS,
        {
            variables,
        },
    );

    const frameworkDetails = removeNull(frameworkDetailsResponse?.analysisFramework);

    const {
        pending: projectPatchPending,
        trigger: projectPatch,
    } = useLazyRequest<ProjectDetails>({
        url: `server://projects/${projectId}/`,
        method: 'PATCH',
        body: ({
            analysisFramework: frameworkId,
        }),
        onSuccess: (response) => {
            setProject((oldProjectDetails) => {
                if (!oldProjectDetails) {
                    return oldProjectDetails;
                }
                return ({
                    ...oldProjectDetails,
                    analysisFramework: {
                        id: String(response.analysisFramework),
                    },
                });
            });
        },
        failureHeader: _ts('projectEdit', 'projectDetailsLabel'),
    });

    const itemRendererParams = useCallback((_, data) => ({
        className: styles.projectTitle,
        children: data.title,
        to: '',
    }), []);

    const [frameworkToClone, setFrameworkToClone] = useState<
        { title: string; description?: string }| undefined
    >();

    const [
        frameworkAddModalShown,
        showFrameworkAddModal,
        hideFrameworkAddModal,
    ] = useModalState(false);

    const handleUseFrameworkClick = useCallback(() => {
        projectPatch(null);
    }, [projectPatch]);

    const handleNewFrameworkAddSuccess = useCallback((newFrameworkId: string) => {
        setFrameworkToClone(undefined);
        onFrameworkCreate(newFrameworkId);
        hideFrameworkAddModal();
    }, [hideFrameworkAddModal, onFrameworkCreate]);

    const handleFrameworkCloneClick = useCallback(() => {
        setFrameworkToClone(frameworkDetails);
        showFrameworkAddModal();
    }, [frameworkDetails, showFrameworkAddModal]);

    const disableAllButtons = projectPatchPending;
    const frameworkRoute = generatePath(routes.analyticalFrameworkEdit.path, {
        frameworkId,
    });

    const canEditFramework = frameworkDetails?.allowedPermissions?.includes('CAN_EDIT_FRAMEWORK');
    const canCloneFramework = frameworkDetails?.allowedPermissions?.includes('CAN_CLONE_FRAMEWORK');
    const canUseFramework = frameworkDetails?.allowedPermissions?.includes('CAN_USE_IN_OTHER_PROJECTS');

    return (
        <div className={_cs(styles.frameworkDetail, className)}>
            {(projectPatchPending || frameworkGetPending) && <PendingMessage />}
            <ContainerCard
                className={styles.frameworkItem}
                heading={frameworkDetails?.title ?? '-'}
                headingSize="small"
                headingDescription={(
                    <TextOutput
                        label={_ts('projectEdit', 'createdAtLabel')}
                        value={frameworkDetails?.createdAt && (
                            <DateOutput
                                value={frameworkDetails.createdAt}
                                format="dd MMM, yyyy"
                            />
                        )}
                    />
                )}
                headerActions={(
                    <>
                        {(projectFrameworkId !== frameworkId) && canUseFramework && (
                            <ConfirmButton
                                variant="secondary"
                                name="useFramework"
                                title={_ts('projectEdit', 'selectFrameworkButtonLabel')}
                                disabled={disableAllButtons}
                                message={(
                                    <>
                                        <p>
                                            { _ts('projectEdit', 'confirmUseFramework', {
                                                title: <b>{frameworkDetails?.title}</b>,
                                            }) }
                                        </p>
                                        <p>
                                            { _ts('projectEdit', 'confirmUseFrameworkText') }
                                        </p>
                                    </>
                                )}
                                onConfirm={handleUseFrameworkClick}
                                icons={(
                                    <IoCheckmark />
                                )}
                                showConfirmationInitially={false}
                            >
                                {_ts('projectEdit', 'selectFrameworkButtonLabel')}
                            </ConfirmButton>
                        )}
                        {projectFrameworkId === frameworkId && (
                            <Tag
                                variant="complement1"
                                icons={(
                                    <IoCheckmark />
                                )}
                            >
                                {_ts('projectEdit', 'selectedFrameworkTagLabel')}
                            </Tag>
                        )}
                        {canEditFramework && (
                            <QuickActionLink
                                variant="secondary"
                                title={_ts('projectEdit', 'editFrameworkLinkTitle')}
                                disabled={disableAllButtons}
                                to={frameworkRoute}
                            >
                                <FiEdit2 />
                            </QuickActionLink>
                        )}
                        {canCloneFramework && (
                            <QuickActionButton
                                title={_ts('projectEdit', 'cloneFrameworkButtonTitle')}
                                variant="secondary"
                                disabled={disableAllButtons}
                                onClick={handleFrameworkCloneClick}
                                name="clone"
                            >
                                <IoCopyOutline />
                            </QuickActionButton>
                        )}
                    </>
                )}
                contentClassName={styles.content}
                borderBelowHeader
                borderBelowHeaderWidth="thin"
            >
                <div className={styles.metadataContainer}>
                    {frameworkDetails?.description}
                    <TextOutput
                        className={styles.block}
                        label={_ts('projectEdit', 'frameworkCreatorTitle')}
                        value={frameworkDetails?.createdBy?.displayName}
                        hideLabelColon
                    />
                    <TextOutput
                        className={styles.block}
                        label={_ts('projectEdit', 'analyticalFrameworkTitle')}
                        value={(
                            <FrameworkImageButton
                                frameworkId={frameworkId}
                                label={_ts('projectEdit', 'referenceFrameworkImageLabel')}
                            />
                        )}
                        hideLabelColon
                    />
                    {(frameworkDetails?.visibleProjects?.length ?? 0) > 0 && (
                        <TextOutput
                            className={styles.block}
                            label={_ts('projectEdit', 'recentlyUsedInProjectsTitle')}
                            value={(
                                <List
                                    data={frameworkDetails?.visibleProjects}
                                    keySelector={itemKeySelector}
                                    rendererParams={itemRendererParams}
                                    renderer={Link}
                                />
                            )}
                            hideLabelColon
                        />
                    )}
                </div>
                <Card className={styles.preview}>
                    Preview
                </Card>
            </ContainerCard>
            {frameworkAddModalShown && (
                <AddFrameworkModal
                    frameworkToClone={frameworkToClone}
                    onActionSuccess={handleNewFrameworkAddSuccess}
                    onModalClose={hideFrameworkAddModal}
                />
            )}
        </div>
    );
}

export default FrameworkDetail;
