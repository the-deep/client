import React, { useMemo, useState, useCallback, useContext } from 'react';
import {
    _cs,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import { generatePath } from 'react-router-dom';
import { gql, useMutation, useQuery } from '@apollo/client';
import {
    IoCopyOutline,
    IoCheckmark,
    IoDownloadOutline,
    IoChevronForward,
} from 'react-icons/io5';
import {
    FiEdit2,
} from 'react-icons/fi';
import {
    Card,
    Tabs,
    Tab,
    Kraken,
    TabList,
    Message,
    TabPanel,
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
    RawButton,
    Button,
    useAlert,
} from '@the-deep/deep-ui';
import { removeNull } from '@togglecorp/toggle-form';

import { Widget } from '#types/newAnalyticalFramework';
import {
    DeepMandatory,
    DeepReplace,
} from '#utils/types';
import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import { ProjectContext } from '#base/context/ProjectContext';
import { useModalState } from '#hooks/stateManagement';
import routes from '#base/configs/routes';
import Section from '#components/entry/Section';
import _ts from '#ts';
import {
    AnalyticalFrameworkPatchMutation,
    AnalyticalFrameworkPatchMutationVariables,
    FrameworkDetailsQuery,
    FrameworkDetailsQueryVariables,
    WidgetType as WidgetRaw,
} from '#generated/types';
import { FRAMEWORK_FRAGMENT } from '#gqlFragments';

import CloneFrameworkModal from '../CloneFrameworkModal';
import styles from './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const emptyObject = {};

const ANALYTICAL_FRAMEWORK_PATCH = gql`
    mutation AnalyticalFrameworkPatch(
        $projectId: ID!,
        $frameworkId: ID,
    ) {
        project(id: $projectId) {
            projectUpdate(data: {analysisFramework: $frameworkId}) {
                ok
                errors
                result {
                    analysisFramework {
                        id
                    }
                }
            }
        }
    }
`;

const FRAMEWORK_DETAILS = gql`
    ${FRAMEWORK_FRAGMENT}
    query FrameworkDetails(
        $frameworkId: ID!,
        $frameworkIds: [ID!],
        $page: Int,
        $pageSize: Int,
    ) {
        analysisFrameworks {
            results {
                title
                id
            }
            totalCount
        }
        analysisFramework(id: $frameworkId) {
            title
            description
            createdAt
            clonedFrom
            allowedPermissions
            createdBy {
                displayName
            }
            export {
                name
                url
            }
            tags {
                description
                icon {
                    name
                    url
                }
                id
                title
            }
            # NOTE: Does not need predictionTagsMapping from FrameworkResponse
            ...FrameworkResponse
        }
        projects (
            analysisFrameworks: $frameworkIds,
            page: $page,
            pageSize: $pageSize,
        ) {
            results {
                title
                id
            }
            totalCount
            page
            pageSize
        }
    }
`;

// FIXME: 'key' is thought to be mandatory from server.
// Remove this DeepMandatory transformation after server sends key as mandatory
type FrameworkRaw = DeepMandatory<NonNullable<FrameworkDetailsQuery['analysisFramework']>, 'key'>;
type Framework = DeepReplace<FrameworkRaw, Omit<WidgetRaw, 'widgetIdDisplay' | 'widthDisplay'>, Widget>;

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
    onClonedFrameworkClick: React.Dispatch<React.SetStateAction<string | undefined>>
}

function FrameworkDetail(props: Props) {
    const {
        className,
        projectFrameworkId,
        frameworkId,
        projectId,
        onFrameworkCreate,
        onClonedFrameworkClick,
    } = props;
    const { setProject } = useContext(ProjectContext);

    const [activeTab, setActiveTab] = useState<'primary' | 'secondary' | undefined>('primary');
    const alert = useAlert();
    const [selectedSection, setSelectedSection] = useState<string | undefined>();

    const variables = useMemo(
        (): FrameworkDetailsQueryVariables => ({
            frameworkId,
            frameworkIds: [frameworkId],
            page: 1,
            pageSize: 10,
        }),
        [
            frameworkId,
        ],
    );
    const {
        loading: frameworkGetPending,
        data: frameworkDetailsResponse,
        fetchMore,
    } = useQuery<FrameworkDetailsQuery, FrameworkDetailsQueryVariables>(
        FRAMEWORK_DETAILS,
        {
            variables,
            onCompleted: (response) => {
                setSelectedSection(response?.analysisFramework?.primaryTagging?.[0]?.clientId);
            },
        },
    );

    // FIXME: do not use removeNull here
    const frameworkDetails = useMemo(
        () => removeNull(frameworkDetailsResponse?.analysisFramework as Framework | undefined),
        [frameworkDetailsResponse],
    );

    const visibleProjects = frameworkDetailsResponse?.projects?.results;

    const sections = frameworkDetails?.primaryTagging;

    const exportLink = frameworkDetails?.export?.url;

    const frameworks = frameworkDetailsResponse?.analysisFrameworks?.results;

    const getFrameworkTitle = useCallback((id: string | undefined) => (
        frameworks?.find((framework) => framework.id === id)?.title
    ), [frameworks]);

    const handleShowMoreVisibleProjects = useCallback(() => {
        fetchMore({
            variables: {
                ...variables,
                page: (frameworkDetailsResponse?.projects?.page ?? 1) + 1,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!previousResult) {
                    return previousResult;
                }

                const oldProjects = previousResult.projects;
                const newProjects = fetchMoreResult?.projects;

                if (!newProjects) {
                    return previousResult;
                }

                return ({
                    ...previousResult,
                    projects: {
                        ...newProjects,
                        results: [
                            ...(oldProjects?.results ?? []),
                            ...(newProjects.results ?? []),
                        ],
                    },
                });
            },
        });
    }, [
        fetchMore,
        variables,
        frameworkDetailsResponse?.projects,
    ]);

    const [
        projectPatch,
        {
            loading: projectPatchPending,
        },
    ] = useMutation<AnalyticalFrameworkPatchMutation, AnalyticalFrameworkPatchMutationVariables>(
        ANALYTICAL_FRAMEWORK_PATCH,
        {
            onCompleted: (response) => {
                if (!response || !response.project?.projectUpdate) {
                    return;
                }
                const {
                    ok,
                    errors,
                    result,
                } = response.project.projectUpdate;

                const analysisFrameworkId = result?.analysisFramework?.id;

                if (errors) {
                    alert.show(
                        'Failed to create assessment registry.',
                        { variant: 'error' },
                    );
                } else if (ok) {
                    if (!analysisFrameworkId) {
                        return;
                    }
                    setProject((oldProjectDetails) => {
                        if (!oldProjectDetails) {
                            return oldProjectDetails;
                        }
                        return ({
                            ...oldProjectDetails,
                            analysisFramework: {
                                id: analysisFrameworkId,
                            },
                        });
                    });
                }
            },
        },
    );

    const itemRendererParams = useCallback((_: string, data: { title: string; id: string }) => ({
        className: styles.projectTitle,
        children: data.title,
        to: generatePath(routes.tagging.path, { projectId: data.id }),
    }), []);

    const [
        frameworkCloneModalShown,
        showFrameworkCloneModal,
        hideFrameworkCloneModal,
    ] = useModalState(false);

    const handleUseFrameworkClick = useCallback(() => {
        projectPatch({
            variables: {
                projectId,
                frameworkId,
            },
        });
    }, [projectPatch, projectId, frameworkId]);

    const handleNewFrameworkAddSuccess = useCallback((newFrameworkId: string) => {
        onFrameworkCreate(newFrameworkId);
        hideFrameworkCloneModal();
    }, [hideFrameworkCloneModal, onFrameworkCreate]);

    const handleFrameworkCloneClick = useCallback(() => {
        showFrameworkCloneModal();
    }, [showFrameworkCloneModal]);

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
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
            >
                <ContainerCard
                    className={styles.frameworkItem}
                    heading={frameworkDetails?.title ?? '-'}
                    headingSize="small"
                    headerClassName={styles.header}
                    headingContainerClassName={styles.headingContainer}
                    headerActionsContainerClassName={styles.headerActions}
                    headingDescription={(
                        <TextOutput
                            label={_ts('projectEdit', 'createdAtLabel')}
                            value={frameworkDetails?.createdAt && (
                                <DateOutput
                                    value={frameworkDetails.createdAt}
                                />
                            )}
                        />
                    )}
                    headerActions={(
                        <>
                            <TabList className={styles.tabList}>
                                <Tab
                                    name="primary"
                                    transparentBorder
                                >
                                    Primary Tagging
                                </Tab>
                                <Tab
                                    name="secondary"
                                    transparentBorder
                                >
                                    Secondary Tagging
                                </Tab>
                            </TabList>
                            <div className={styles.actions}>
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
                                {isDefined(exportLink) && (
                                    <QuickActionLink
                                        to={exportLink}
                                        variant="secondary"
                                        title="Export framework"
                                    >
                                        <IoDownloadOutline />
                                    </QuickActionLink>
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
                            </div>
                        </>
                    )}
                    contentClassName={styles.content}
                >
                    <div className={styles.metadataContainer}>
                        {frameworkDetailsResponse?.projects?.totalCount === 0 && (
                            <div className={styles.warning}>
                                This framework has not been used in any project in DEEP.
                            </div>
                        )}
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
                        <TextOutput
                            className={styles.block}
                            label="Cloned from"
                            value={isDefined(frameworkDetails?.clonedFrom)
                                ? (
                                    <RawButton
                                        name={frameworkDetails?.clonedFrom}
                                        onClick={onClonedFrameworkClick}
                                        disabled={isNotDefined(frameworkDetails?.clonedFrom)}
                                    >
                                        {getFrameworkTitle(frameworkDetails?.clonedFrom)}
                                    </RawButton>
                                ) : '-'}
                            valueContainerClassName={styles.value}
                            hideLabelColon
                        />
                        <TextOutput
                            className={styles.block}
                            label="Used in"
                            value={`${frameworkDetailsResponse?.projects?.totalCount ?? '-'} projects`}
                            hideLabelColon
                        />
                        {frameworkDetails?.tags?.map((tag) => (
                            <Tag
                                key={tag.id}
                                variant="gradient1"
                                icons={tag.icon?.url && (
                                    <img
                                        className={styles.icon}
                                        src={tag.icon.url}
                                        alt={tag.icon?.url}
                                    />
                                )}
                            >
                                <div title={tag.description}>
                                    {tag.title}
                                </div>
                            </Tag>
                        ))}
                        {(isDefined(visibleProjects)
                            && isDefined(frameworkDetailsResponse?.projects)
                            && ((visibleProjects?.length ?? 0)) > 0) && (
                            <>
                                <TextOutput
                                    className={styles.block}
                                    label={_ts('projectEdit', 'recentlyUsedInProjectsTitle')}
                                    value={(
                                        <List
                                            data={visibleProjects}
                                            keySelector={itemKeySelector}
                                            rendererParams={itemRendererParams}
                                            renderer={Link}
                                        />
                                    )}
                                    hideLabelColon
                                />
                                {((visibleProjects?.length ?? 0 + 1)
                                < (frameworkDetailsResponse?.projects?.totalCount ?? 0)) && (
                                    <Button
                                        name={undefined}
                                        actions={<IoChevronForward />}
                                        onClick={handleShowMoreVisibleProjects}
                                        variant="transparent"
                                        className={styles.showMore}
                                    >
                                        Show more
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                    <Card className={styles.preview}>
                        <TabPanel
                            name="primary"
                            activeClassName={styles.tabPanel}
                            retainMount="lazy"
                        >
                            <Tabs
                                value={selectedSection}
                                onChange={setSelectedSection}
                                variant="step"
                            >
                                {(sections?.length ?? 0) > 0 ? (
                                    <>
                                        <TabList className={styles.tabs}>
                                            {sections?.map((section) => (
                                                <Tab
                                                    key={section.clientId}
                                                    name={section.clientId}
                                                    borderWrapperClassName={styles.borderWrapper}
                                                    className={styles.tab}
                                                    title={section.tooltip}
                                                >
                                                    {section.title}
                                                </Tab>
                                            ))}
                                        </TabList>
                                        {(
                                            sections?.map((section) => (
                                                <TabPanel
                                                    key={section.clientId}
                                                    name={section.clientId}
                                                    activeClassName={styles.panel}
                                                >
                                                    <Section
                                                        allWidgets={undefined}
                                                        widgets={section.widgets}
                                                        onAttributeChange={noop}
                                                        attributesMap={emptyObject}
                                                        error={undefined}
                                                        onGeoAreaOptionsChange={noop}
                                                        geoAreaOptions={undefined}
                                                        disabled
                                                    />
                                                </TabPanel>
                                            ))
                                        )}
                                    </>
                                ) : (
                                    <Message
                                        icon={(
                                            <Kraken
                                                size="large"
                                                variant="sleep"
                                            />
                                        )}
                                        message="There are no sections in this framework."
                                    />
                                )}
                            </Tabs>
                        </TabPanel>
                        <TabPanel
                            name="secondary"
                            retainMount="lazy"
                        >
                            <Section
                                allWidgets={undefined}
                                widgets={frameworkDetails?.secondaryTagging}
                                onAttributeChange={noop}
                                attributesMap={emptyObject}
                                error={undefined}
                                onGeoAreaOptionsChange={noop}
                                geoAreaOptions={undefined}
                                disabled
                            />
                        </TabPanel>
                    </Card>
                </ContainerCard>
            </Tabs>
            {frameworkCloneModalShown && (
                <CloneFrameworkModal
                    projectId={projectId}
                    frameworkToClone={frameworkId}
                    frameworkTitle={frameworkDetails?.title}
                    frameworkDescription={frameworkDetails?.description}
                    onCloneSuccess={handleNewFrameworkAddSuccess}
                    onModalClose={hideFrameworkCloneModal}
                />
            )}
        </div>
    );
}

export default FrameworkDetail;
