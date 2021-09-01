import React, { useState, useCallback } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import { generatePath } from 'react-router-dom';
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

import FrameworkImageButton from '#components/FrameworkImageButton';
import { useLazyRequest, useRequest } from '#base/utils/restRequest';
import { useModalState } from '#hooks/stateManagement';
import routes from '#base/configs/routes';
import _ts from '#ts';
import { ProjectDetails } from '#types';

import AddFrameworkModal from '../AddFrameworkModal';
import styles from './styles.css';

interface ProjectItem {
    id: number;
    title: string;
    isPrivate: boolean;
}

interface Framework {
    id: number;
    title: string;
    description?: string;
    createdAt: string;
    createdByName: string;
    visibleProjects: ProjectItem[];
    previewImage?: string;
}

const itemKeySelector = (d: ProjectItem) => d.id;

interface Props {
    className?: string;
    projectFrameworkId?: number;
    frameworkId: number;
    projectId: number;
    onProjectChange: (project: ProjectDetails) => void;
    onFrameworkCreate: (newFrameworkId: number) => void;
}

function FrameworkDetail(props: Props) {
    const {
        className,
        projectFrameworkId,
        frameworkId,
        projectId,
        onProjectChange,
        onFrameworkCreate,
    } = props;

    const {
        pending: frameworkGetPending,
        response: frameworkDetails,
    } = useRequest<Framework>({
        skip: isNotDefined(frameworkId),
        url: `server://analysis-frameworks/${frameworkId}/`,
        method: 'GET',
        failureHeader: _ts('projectEdit', 'frameworkDetails'),
    });

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
            onProjectChange(response);
        },
        failureHeader: _ts('projectEdit', 'projectDetailsLabel'),
    });

    const itemRendererParams = useCallback((_, data) => ({
        className: styles.projectTitle,
        children: data.title,
        to: '',
    }), []);

    const [frameworkToClone, setFrameworkToClone] = useState<Framework | undefined>();

    const [
        frameworkAddModalShown,
        showFrameworkAddModal,
        hideFrameworkAddModal,
    ] = useModalState(false);

    const handleUseFrameworkClick = useCallback(() => {
        projectPatch(null);
    }, [projectPatch]);

    const handleNewFrameworkAddSuccess = useCallback((newFrameworkId: number) => {
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

    return (
        <div className={_cs(styles.frameworkDetail, className)}>
            {(projectPatchPending || frameworkGetPending) && <PendingMessage />}
            <ContainerCard
                className={styles.frameworkItem}
                heading={frameworkDetails?.title ?? '-'}
                headerDescriptionClassName={styles.createdAtContainer}
                headingDescription={(
                    <>
                        {_ts('projectEdit', 'createdAtLabel')}
                        {frameworkDetails?.createdAt && (
                            <DateOutput
                                className={styles.createdDate}
                                value={frameworkDetails.createdAt}
                                format="dd MMM, yyyy"
                            />
                        )}
                    </>
                )}
                headerActions={(
                    <>
                        {projectFrameworkId !== frameworkId && (
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
                        <QuickActionLink
                            variant="secondary"
                            title={_ts('projectEdit', 'editFrameworkLinkTitle')}
                            disabled={disableAllButtons}
                            to={frameworkRoute}
                        >
                            <FiEdit2 />
                        </QuickActionLink>
                        <QuickActionButton
                            title={_ts('projectEdit', 'cloneFrameworkButtonTitle')}
                            variant="secondary"
                            disabled={disableAllButtons}
                            onClick={handleFrameworkCloneClick}
                            name="clone"
                        >
                            <IoCopyOutline />
                        </QuickActionButton>
                    </>
                )}
                contentClassName={styles.content}
            >
                <div className={styles.metadataContainer}>
                    {frameworkDetails?.description}
                    <TextOutput
                        className={styles.block}
                        label={_ts('projectEdit', 'frameworkCreatorTitle')}
                        value={frameworkDetails?.createdByName}
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
