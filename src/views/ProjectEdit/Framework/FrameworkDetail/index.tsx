import React, { useCallback } from 'react';
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
} from '@the-deep/deep-ui';

import TextOutput from '#components/general/TextOutput';
import DateOutput from '#rscv/FormattedDate';
import Icon from '#rscg/Icon';
import { pathNames } from '#constants';
import { useLazyRequest, useRequest } from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';
import {
    ProjectDetails,
} from '#typings';

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
}

const itemKeySelector = (d: ProjectItem) => d.id;

interface Props {
    className?: string;
    projectFrameworkId: number;
    frameworkId: number;
    projectId: number;
    onProjectChange: () => void;
}

function FrameworkDetail(props: Props) {
    const {
        className,
        projectFrameworkId,
        frameworkId,
        projectId,
        onProjectChange,
    } = props;

    const {
        pending: frameworkGetPending,
        response: frameworkDetails,
    } = useRequest<Framework>({
        skip: isNotDefined(frameworkId),
        url: `server://analysis-frameworks/${frameworkId}/`,
        method: 'GET',
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('projectEdit', 'frameworkDetails'))({ error: errorBody }),
    });

    const {
        pending: projectPatchPending,
        trigger: projectPatch,
    } = useLazyRequest<ProjectDetails>({
        url: `server://projects/${projectId}/`,
        method: projectId ? 'PATCH' : 'POST',
        body: ({
            analysisFramework: frameworkId,
        }),
        onSuccess: () => {
            onProjectChange();
        },
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('projectEdit', 'projectDetailsLabel'))({ error: errorBody }),
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

    const handleUseFrameworkClick = useCallback(() => {
        projectPatch(null);
    }, [projectPatch]);

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
                        >
                            {_ts('projectEdit', 'addNewFrameworkButtonLabel')}
                        </Button>
                    )}
                />
            </div>
            <ContainerCard
                className={styles.frameworkItem}
                heading={frameworkDetails?.title}
                sub
                headerDescription={(
                    <>
                        {_ts('projectEdit', 'createdAtLabel')}
                        <DateOutput
                            className={styles.createdDate}
                            value={frameworkDetails?.createdAt}
                        />
                    </>
                )}
                headerActions={(
                    <>
                        {projectFrameworkId !== frameworkId && (
                            <ConfirmButton
                                variant="inverted"
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
                            variant="inverted"
                            title={_ts('projectEdit', 'editFrameworkLinkTitle')}
                            disabled={disableAllButtons}
                            to={reverseRoute(
                                pathNames.analyticalFramework,
                                {
                                    analyticalFrameworkId: frameworkId,
                                },
                            )}
                        >
                            <Icon
                                name="edit"
                            />
                        </QuickActionLink>
                        <QuickActionButton
                            title={_ts('projectEdit', 'cloneFrameworkButtonTitle')}
                            variant="inverted"
                            disabled={disableAllButtons}
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
                                data={frameworkDetails?.visibleProjects ?? []}
                                keySelector={itemKeySelector}
                                rendererParams={itemRendererParams}
                                renderer={Link}
                            />
                        )}
                    />
                </div>
                <Card className={styles.rightContainer}>
                    { /* FIXME: This content will be removed later */}
                    Framework preview goes here
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
                        src=""
                    />
                </Modal>
            )}
        </div>
    );
}

export default FrameworkDetail;
