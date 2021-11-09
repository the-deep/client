import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoClose } from 'react-icons/io5';
import {
    QuickActionButton,
    Container,
    DateOutput,
    ListView,
    Footer,
    Pager,
    TextOutput,
} from '@the-deep/deep-ui';

import { ProjectDetailsForMapViewQuery } from '#generated/types';

import styles from './styles.css';

type ProjectDetail = NonNullable<NonNullable<NonNullable<ProjectDetailsForMapViewQuery['projects']>['results']>[number]>;

interface TooltipProps {
    projectTitle: string;
    frameworkTitle: string;
    description: string;
    startDate: string;
    numberOfUsers: number;
    numberOfLeads: number;
    numberOfEntries: number;
}

function tooltipRenderer(props: TooltipProps) {
    const {
        projectTitle,
        frameworkTitle,
        startDate,
        description,
        numberOfEntries,
        numberOfLeads,
        numberOfUsers,
    } = props;

    return (
        <div className={styles.tooltipContainer}>
            <header className={_cs(styles.projectTitle, styles.inline)}>
                <TextOutput
                    value={projectTitle}
                />
                <DateOutput
                    value={startDate}
                />
            </header>
            <TextOutput
                value={frameworkTitle}
            />
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
            <div className={styles.description}>
                {description}
            </div>
        </div>
    );
}

const keySelector = (d: ProjectDetail) => d.id;

interface Props {
    projectDetails?: ProjectDetail[];
    page: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    onTooltipCloseButtonClick: () => void;
    totalCount: number;
}

function MapTooltipDetails(props: Props) {
    const {
        projectDetails,
        page,
        pageSize,
        setPage,
        setPageSize,
        onTooltipCloseButtonClick,
        totalCount,
    } = props;

    const rendererParams = useCallback((_, datum) => ({
        value: datum,
        projectId: datum?.id,
        projectTitle: datum?.title,
        description: datum?.description,
        frameworkTitle: datum?.analysisFramework?.title,
        startDate: datum?.startDate,
        numberOfEntries: datum?.stats?.numberOfEntries,
        numberOfLeads: datum?.stats?.numberOfLeads,
        numberOfUsers: datum?.stats?.numberOfUsers,
    }), []);

    return (
        <Container
            className={styles.mapTooltip}
            heading="Projects"
            headingSize="extraSmall"
            headerActions={(
                <QuickActionButton
                    name={undefined}
                    onClick={onTooltipCloseButtonClick}
                >
                    <IoClose />
                </QuickActionButton>
            )}
            spacing="compact"
        >
            <ListView
                className={styles.list}
                keySelector={keySelector}
                data={projectDetails}
                renderer={tooltipRenderer}
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

export default MapTooltipDetails;
