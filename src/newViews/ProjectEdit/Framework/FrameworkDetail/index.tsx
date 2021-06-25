import React, { useState, useCallback } from 'react';
import {
    _cs,
    reverseRoute,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    IoCopyOutline,
    IoCheckmark,
    IoAdd,
} from 'react-icons/io5';
import { MdModeEdit } from 'react-icons/md';
import {
    Modal,
    ImagePreview,
    ConfirmButton,
    Button,
    Tag,
    List,
    PendingMessage,
    ElementFragments,
    QuickActionLink,
    QuickActionButton,
    ContainerCard,
    Card,
    Link,
    DateOutput,
} from '@the-deep/deep-ui';

import TextOutput from '#components/general/TextOutput';
import { pathNames } from '#constants';
import { useLazyRequest, useRequest } from '#utils/request';
import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';
import { ProjectDetails } from '#typings';

import AddFrameworkModal from '../AddFrameworkModal';
import styles from './styles.scss';

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
    onFrameworkChange: (newFrameworkSelected: number) => void;
}

function FrameworkDetail(props: Props) {
    const {
        className,
        projectFrameworkId,
        frameworkId,
        projectId,
        onProjectChange,
        onFrameworkChange,
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

    const itemRendererParams = useCallback((key, data) => ({
        className: styles.projectTitle,
        children: data.title,
        to: '',
    }), []);

    const [
        referenceImageShown,
        showReferenceImage,
        hideReferenceImage,
    ] = useModalState(false);

    const [frameworkToClone, setFrameworkToClone] = useState<Framework | undefined>();

    const [
        frameworkAddModalShown,
        showFrameworkAddModal,
        hideFrameworkAddModal,
    ] = useModalState(false);

    const handleUseFrameworkClick = useCallback(() => {
        projectPatch(null);
    }, [projectPatch]);

    const handleFrameworkAddClick = useCallback(() => {
        setFrameworkToClone(undefined);
        showFrameworkAddModal();
    }, [showFrameworkAddModal]);

    const handleNewFrameworkAddSuccess = useCallback((newFrameworkId: number) => {
        setFrameworkToClone(undefined);
        onFrameworkChange(newFrameworkId);
        hideFrameworkAddModal();
    }, [onFrameworkChange, hideFrameworkAddModal]);

    const handleFrameworkCloneClick = useCallback(() => {
        setFrameworkToClone(frameworkDetails);
        showFrameworkAddModal();
    }, [frameworkDetails, showFrameworkAddModal]);

    const disableAllButtons = projectPatchPending;

    return (
        <div className={_cs(styles.frameworkDetail, className)}>
            {(projectPatchPending || frameworkGetPending) && <PendingMessage />}
            <div className={styles.header}>
                <ElementFragments
                    iconsContainerClassName={styles.label}
                    icons={_ts('projectEdit', 'infoOnFrameworkLabel')}
                    actions={(
                        <Button
                            name="addNewFramework"
                            title={_ts('projectEdit', 'addNewFrameworkButtonLabel')}
                            icons={(<IoAdd />)}
                            disabled={disableAllButtons}
                            onClick={handleFrameworkAddClick}
                        >
                            {_ts('projectEdit', 'addNewFrameworkButtonLabel')}
                        </Button>
                    )}
                />
            </div>
            <ContainerCard
                className={styles.frameworkItem}
                heading={frameworkDetails?.title ?? '-'}
                sub
                headerDescriptionClassName={styles.createdAtContainer}
                headerDescription={(
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
                            to={reverseRoute(
                                pathNames.analyticalFramework,
                                {
                                    analyticalFrameworkId: frameworkId,
                                },
                            )}
                        >
                            <MdModeEdit />
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
                <div className={styles.leftContainer}>
                    <div className={styles.frameworkDescription}>
                        {frameworkDetails?.description}
                    </div>
                    <TextOutput
                        className={styles.block}
                        label={_ts('projectEdit', 'frameworkCreatorTitle')}
                        value={frameworkDetails?.createdByName}
                        type="small-block"
                    />
                    <TextOutput
                        className={styles.block}
                        label={_ts('projectEdit', 'analyticalFrameworkTitle')}
                        value={(
                            <Button
                                variant="action"
                                name="openImageButton"
                                onClick={showReferenceImage}
                            >
                                {_ts('projectEdit', 'referenceFrameworkImageLabel')}
                            </Button>
                        )}
                        type="small-block"
                    />
                    <TextOutput
                        className={styles.block}
                        label={_ts('projectEdit', 'recentlyUsedInProjectsTitle')}
                        type="small-block"
                        value={(
                            <List
                                data={frameworkDetails?.visibleProjects}
                                keySelector={itemKeySelector}
                                rendererParams={itemRendererParams}
                                renderer={Link}
                            />
                        )}
                    />
                </div>
                <Card className={styles.rightContainer}>
                    <ImagePreview
                        alt={_ts('projectEdit', 'frameworkReferenceImageAlt')}
                        hideTools
                        src={frameworkDetails?.previewImage}
                    />
                </Card>
            </ContainerCard>
            {referenceImageShown && (
                <Modal
                    className={styles.referenceImageModal}
                    heading={_ts('projectEdit', 'frameworkReferenceImageModalHeading')}
                    onCloseButtonClick={hideReferenceImage}
                >
                    <ImagePreview
                        alt={_ts('projectEdit', 'frameworkReferenceImageAlt')}
                        hideTools
                        src={frameworkDetails?.previewImage}
                    />
                </Modal>
            )}
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
