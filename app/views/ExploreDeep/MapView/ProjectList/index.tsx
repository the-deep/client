import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoClose } from 'react-icons/io5';
import {
    QuickActionButton,
    ControlledExpandableContainer,
    Container,
    DateOutput,
    ListView,
    Footer,
    Pager,
    TextOutput,
} from '@the-deep/deep-ui';

import { ProjectDetailsForMapViewQuery } from '#generated/types';

import ActionCell from '../../ActionCell';
import styles from './styles.css';

type ProjectDetail = NonNullable<NonNullable<NonNullable<ProjectDetailsForMapViewQuery['projects']>['results']>[number]>;

interface ProjectListProps {
    projectId: string;
    projectDetails: ProjectDetail;
    projectTitle: string;
    frameworkTitle?: string;
    description: string;
    startDate?: string;
    numberOfUsers?: number;
    numberOfLeads?: number;
    numberOfEntries?: number;
    expanded: boolean;
    onExpansionChange: (_: boolean, name: string) => void;
    refetchProjectDetails: () => void;
}

function ListRenderer(props: ProjectListProps) {
    const {
        projectId,
        projectDetails,
        projectTitle,
        frameworkTitle,
        startDate,
        description,
        numberOfEntries,
        numberOfLeads,
        numberOfUsers,
        expanded,
        onExpansionChange,
        refetchProjectDetails,
    } = props;

    return (
        <ControlledExpandableContainer
            name={projectId}
            className={styles.projectListContainer}
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
                    value={startDate}
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
            <TextOutput
                value={frameworkTitle}
            />
            <div>
                {description}
            </div>
            <ActionCell
                className={styles.joinButton}
                projectId={projectId}
                membershipPending={projectDetails?.membershipPending}
                isMember={!projectDetails?.currentUserRole}
                onMemberStatusChange={refetchProjectDetails}
                variant="primary"
            />
        </ControlledExpandableContainer>
    );
}

const keySelector = (d: ProjectDetail) => d.id;

interface Props {
    projectDetails?: ProjectDetail[];
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
        description: datum?.description,
        frameworkTitle: datum?.analysisFramework?.title,
        startDate: datum?.startDate ?? undefined,
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
            headingSize="extraSmall"
            headerActions={(
                <QuickActionButton
                    name={undefined}
                    onClick={onListCloseButtonClick}
                >
                    <IoClose />
                </QuickActionButton>
            )}
            spacing="loose"
        >
            <ListView
                className={styles.list}
                keySelector={keySelector}
                data={projectDetails}
                renderer={ListRenderer}
                rendererParams={rendererParams}
            />
            <Footer
                className={styles.footer}
            >
                <Pager
                    className={styles.pager}
                    activePage={page}
                    itemsCount={totalCount}
                    maxItemsPerPage={pageSize}
                    onActivePageChange={setPage}
                    onItemsPerPageChange={setPageSize}
                    itemsPerPageControlHidden
                />
            </Footer>
        </Container>
    );
}

export default ProjectList;
