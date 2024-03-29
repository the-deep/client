import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoClose } from 'react-icons/io5';
import {
    QuickActionButton,
    ControlledExpandableContainer,
    Container,
    Message,
    DateOutput,
    ListView,
    Kraken,
    Pager,
    TextOutput,
} from '@the-deep/deep-ui';

import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import { ProjectDetailsForMapViewQuery } from '#generated/types';

import ActionCell from '../../ActionCell';
import styles from './styles.css';

type ProjectDetail = NonNullable<NonNullable<NonNullable<ProjectDetailsForMapViewQuery['projects']>['results']>[number]>;

interface ProjectListProps {
    projectId: string;
    projectDetails: ProjectDetail;
    projectTitle: string;
    frameworkTitle?: string;
    frameworkId?: string;
    description: string;
    createdAt?: string;
    numberOfUsers?: number;
    numberOfLeads?: number;
    numberOfEntries?: number;
    expanded: boolean;
    isRejected: boolean;
    onExpansionChange: (_: boolean, name: string) => void;
    refetchProjectDetails: () => void;
}

function ListRenderer(props: ProjectListProps) {
    const {
        projectId,
        projectDetails,
        projectTitle,
        frameworkTitle,
        frameworkId,
        createdAt,
        description,
        numberOfEntries,
        numberOfLeads,
        numberOfUsers,
        expanded,
        isRejected,
        onExpansionChange,
        refetchProjectDetails,
    } = props;

    return (
        <ControlledExpandableContainer
            name={projectId}
            className={styles.projectContainer}
            spacing="compact"
            headingSize="extraSmall"
            heading={(
                <TextOutput
                    value={projectTitle}
                />
            )}
            headingDescription={(
                <DateOutput
                    className={styles.date}
                    value={createdAt}
                />
            )}
            headingClassName={styles.heading}
            contentClassName={styles.content}
            expansionTriggerArea="arrow"
            onExpansionChange={onExpansionChange}
            expanded={expanded}
            withoutBorder
        >
            <div className={styles.inline}>
                <TextOutput
                    label="Users"
                    value={numberOfUsers}
                    hideLabelColon
                />
                <TextOutput
                    label="Sources"
                    value={numberOfLeads}
                    hideLabelColon
                />
                <TextOutput
                    label="Entries"
                    value={numberOfEntries}
                    hideLabelColon
                />
            </div>
            {frameworkTitle && (
                <FrameworkImageButton
                    frameworkId={frameworkId}
                    label={frameworkTitle}
                />
            )}
            {description && (
                <div>
                    {description}
                </div>
            )}
            <ActionCell
                className={styles.joinButton}
                projectId={projectId}
                membershipPending={projectDetails?.membershipPending}
                isRejected={isRejected}
                isMember={!!projectDetails?.currentUserRole}
                onMemberStatusChange={refetchProjectDetails}
                variant="primary"
            />
        </ControlledExpandableContainer>
    );
}

const keySelector = (d: ProjectDetail) => d.id;

interface Props {
    projectDetails?: ProjectDetail[];
    projectDetailsPending: boolean;
    page: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    onListCloseButtonClick: () => void;
    totalCount: number;
    refetchProjectDetails: () => void;
}

function ProjectList(props: Props) {
    const {
        projectDetails,
        projectDetailsPending,
        page,
        pageSize,
        setPage,
        setPageSize,
        onListCloseButtonClick,
        totalCount,
        refetchProjectDetails,
    } = props;

    const [
        expandedProjectId,
        setExpandedProjectId,
    ] = useState<string | undefined>();

    const handleExpansionChange = useCallback((projectExpanded: boolean, projectId: string) => {
        setExpandedProjectId(projectExpanded ? projectId : undefined);
    }, []);

    const rendererParams = useCallback((_: string, datum: ProjectDetail): ProjectListProps => ({
        projectId: datum?.id,
        projectDetails: datum,
        projectTitle: datum?.title,
        isRejected: datum.isRejected,
        description: datum?.description,
        frameworkId: datum?.analysisFramework?.id,
        frameworkTitle: datum?.analysisFramework?.title,
        createdAt: datum?.createdAt ?? undefined,
        numberOfEntries: datum?.stats?.numberOfEntries ?? 0,
        numberOfLeads: datum?.stats?.numberOfLeads ?? 0,
        numberOfUsers: datum?.stats?.numberOfUsers ?? 0,
        onExpansionChange: handleExpansionChange,
        expanded: expandedProjectId === datum.id,
        refetchProjectDetails,
    }), [
        handleExpansionChange,
        expandedProjectId,
        refetchProjectDetails,
    ]);

    return (
        <Container
            className={styles.projectList}
            heading={_cs('Projects: ', totalCount.toString())}
            headingSize="small"
            headingDescription={(
                <Message
                    className={styles.message}
                    message="Showing all unique projects within the selected cluster"
                />
            )}
            headerActions={(
                <QuickActionButton
                    name={undefined}
                    onClick={onListCloseButtonClick}
                    title="Close"
                >
                    <IoClose />
                </QuickActionButton>
            )}
            spacing="loose"
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={totalCount}
                    maxItemsPerPage={pageSize}
                    onActivePageChange={setPage}
                    onItemsPerPageChange={setPageSize}
                    itemsPerPageControlHidden
                />
            )}
        >
            <ListView
                className={styles.list}
                keySelector={keySelector}
                data={projectDetails}
                renderer={ListRenderer}
                rendererParams={rendererParams}
                // NOTE: Nothing to filter here
                filtered={false}
                errored={false}
                pending={projectDetailsPending}
                emptyIcon={(
                    <Kraken
                        variant="skydive"
                    />
                )}
                emptyMessage="No projects found."
                messageIconShown
                messageShown
            />
        </Container>
    );
}

export default ProjectList;
