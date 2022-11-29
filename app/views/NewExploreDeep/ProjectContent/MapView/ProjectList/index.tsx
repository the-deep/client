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
    Footer,
    Kraken,
    Pager,
    TextOutput,
} from '@the-deep/deep-ui';

import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import { PublicProjectDetailsForMapViewQuery } from '#generated/types';

import styles from './styles.css';

type ProjectDetail = NonNullable<NonNullable<NonNullable<PublicProjectDetailsForMapViewQuery['publicProjects']>['results']>[number]>;

interface ProjectListProps {
    projectId: string;
    projectTitle: string;
    frameworkTitle?: string;
    frameworkPreviewImage?: string;
    description: string;
    createdAt?: string;
    numberOfUsers?: number;
    numberOfLeads?: number;
    numberOfEntries?: number;
    expanded: boolean;
    onExpansionChange: (_: boolean, name: string) => void;
}

function ListRenderer(props: ProjectListProps) {
    const {
        projectId,
        projectTitle,
        frameworkTitle,
        createdAt,
        description,
        numberOfEntries,
        frameworkPreviewImage,
        numberOfLeads,
        numberOfUsers,
        expanded,
        onExpansionChange,
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
                    image={frameworkPreviewImage}
                    label={frameworkTitle}
                />
            )}
            {description && (
                <div>
                    {description}
                </div>
            )}
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
    projectDetailsPending: boolean;
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
        projectTitle: datum?.title,
        description: datum?.description,
        frameworkTitle: datum?.analysisFrameworkTitle ?? undefined,
        frameworkPreviewImage: datum?.analysisFrameworkPreviewImage ?? undefined,
        createdAt: datum?.createdAt ?? undefined,
        numberOfEntries: datum?.numberOfEntries ?? 0,
        numberOfLeads: datum?.numberOfLeads ?? 0,
        numberOfUsers: datum?.numberOfUsers ?? 0,
        onExpansionChange: handleExpansionChange,
        expanded: expandedProjectId === datum.id,
    }), [
        handleExpansionChange,
        expandedProjectId,
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
        >
            <ListView
                className={styles.list}
                keySelector={keySelector}
                data={projectDetails}
                renderer={ListRenderer}
                rendererParams={rendererParams}
                // NOTE: Nothing to filter here
                filtered={false}
                pending={projectDetailsPending}
                errored={false}
                emptyIcon={(
                    <Kraken
                        variant="skydive"
                    />
                )}
                emptyMessage="No projects found."
                messageIconShown
                messageShown
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
