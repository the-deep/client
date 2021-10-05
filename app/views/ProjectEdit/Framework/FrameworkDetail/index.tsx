import React, { useMemo, useState, useCallback, useContext } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import { generatePath } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import {
    IoEarth,
    IoCopyOutline,
    IoCheckmark,
} from 'react-icons/io5';
import { FiEdit2 } from 'react-icons/fi';
import {
    Card,
    Tabs,
    Tab,
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
} from '@the-deep/deep-ui';
import { removeNull } from '@togglecorp/toggle-form';

import { Widget } from '#types/newAnalyticalFramework';
import {
    DeepMandatory,
    DeepReplace,
} from '#utils/types';
import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import { useLazyRequest } from '#base/utils/restRequest';
import { ProjectContext } from '#base/context/ProjectContext';
import { useModalState } from '#hooks/stateManagement';
import routes from '#base/configs/routes';
import Section from '#components/entry/Section';
import _ts from '#ts';
import { ProjectDetails } from '#types';
import {
    FrameworkDetailsQuery,
    FrameworkDetailsQueryVariables,
    WidgetType as WidgetRaw,
} from '#generated/types';

import AddFrameworkModal from '../AddFrameworkModal';
import styles from './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const emptyObject = {};

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

    const [activeTab, setActiveTab] = useState<'primary' | 'secondary' | undefined>('primary');
    const [selectedSection, setSelectedSection] = useState<string | undefined>();

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
    const sections = frameworkDetails?.primaryTagging;

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
                const { analysisFramework } = response;
                if (!oldProjectDetails || isNotDefined(analysisFramework)) {
                    return oldProjectDetails;
                }
                return ({
                    ...oldProjectDetails,
                    analysisFramework: {
                        id: String(analysisFramework),
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
        { title: string; description?: string } | undefined
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
                                    format="dd MMM, yyyy"
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
                        <TabPanel
                            name="primary"
                            className={styles.tabPanel}
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
                                                    className={styles.panel}
                                                >
                                                    <Section
                                                        widgets={section.widgets}
                                                        onAttributeChange={noop}
                                                        attributesMap={emptyObject}
                                                        error={undefined}
                                                    />
                                                </TabPanel>
                                            ))
                                        )}
                                    </>
                                ) : (
                                    <Message
                                        icon={(
                                            <IoEarth />
                                        )}
                                        message="There are no sections in this framework"
                                    />
                                )}
                            </Tabs>
                        </TabPanel>
                        <TabPanel
                            name="secondary"
                        >
                            <Section
                                widgets={frameworkDetails?.secondaryTagging}
                                onAttributeChange={noop}
                                attributesMap={emptyObject}
                                error={undefined}
                            />
                        </TabPanel>
                    </Card>
                </ContainerCard>
            </Tabs>
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
