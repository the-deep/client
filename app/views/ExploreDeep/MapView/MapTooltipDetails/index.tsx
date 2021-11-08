import React, { useCallback } from 'react';

import {
    Container,
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
    analysisFrameworkTitle: string;
}

function tooltipRenderer(props: TooltipProps) {
    const {
        projectTitle,
        analysisFrameworkTitle,
    } = props;

    return (
        <div className={styles.tooltipContainer}>
            <div className={styles.projectTitle}>
                {projectTitle}
            </div>
            <TextOutput
                label="Framework used"
                value={analysisFrameworkTitle}
                hideLabelColon
            />
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
    totalCount: number;
}

function MapTooltipDetails(props: Props) {
    const {
        projectDetails,
        page,
        pageSize,
        setPage,
        setPageSize,
        totalCount,
    } = props;

    const rendererParams = useCallback((_, datum) => ({
        value: datum,
        projectDetailsPass: projectDetails,
        projectTitle: datum?.title,
        description: datum?.description,
        analysisFrameworkTitle: datum?.analysisFramework?.title,
    }), [projectDetails]);

    return (
        <Container
            className={styles.mapTooltip}
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
