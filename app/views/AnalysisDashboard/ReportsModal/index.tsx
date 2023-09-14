import React, { useCallback, useState, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import {
    Modal,
    Pager,
    ListView,
} from '@the-deep/deep-ui';

import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import {
    ReportsFromAnalysisListQuery,
    ReportsFromAnalysisListQueryVariables,
} from '#generated/types';
import routes from '#base/configs/routes';

import ReportItem from './ReportItem';

const REPORTS_FROM_ANALYSIS_LIST = gql`
    query ReportsFromAnalysisList(
        $projectId: ID!,
        $analysisId: ID!,
        $page: Int,
        $pageSize: Int,
    )
    {
        project(id: $projectId) {
            id
            analysisReports(
                page: $page,
                pageSize: $pageSize,
                analyses: [$analysisId],
            ) {
                page
                pageSize
                totalCount
                results {
                    title
                    id
                    slug
                    latestSnapshot {
                        publishedBy {
                            displayName
                            id
                        }
                        publishedOn
                    }
                }
            }
        }
    }
`;

type Report = NonNullable<NonNullable<NonNullable<ReportsFromAnalysisListQuery['project']>['analysisReports']>['results']>[number];

const reportsKeySelector = (item: Report) => item.id;

const MAX_ITEMS_PER_PAGE = 10;

interface Props {
    onCloseButtonClick: () => void;
    analysisId: string;
    projectId: string;
}

function ReportsModal(props: Props) {
    const {
        analysisId,
        projectId,
        onCloseButtonClick,
    } = props;

    const [activePage, setActivePage] = useState(1);

    const variables = useMemo(() => ({
        projectId,
        analysisId,
        activePage,
        pageSize: MAX_ITEMS_PER_PAGE,
    }), [
        analysisId,
        projectId,
        activePage,
    ]);

    const {
        data,
        loading,
    } = useQuery<ReportsFromAnalysisListQuery, ReportsFromAnalysisListQueryVariables>(
        REPORTS_FROM_ANALYSIS_LIST,
        {
            variables,
        },
    );

    const reportsRendererParams = useCallback((reportId: string, report: Report) => ({
        title: report.title,
        slug: report.slug,
        projectId,
        reportId,
        latestPublishedBy: report.latestSnapshot?.publishedBy.displayName,
        latestPublishedOn: report.latestSnapshot?.publishedOn,
    }), [projectId]);

    return (
        <Modal
            heading="Reports"
            onCloseButtonClick={onCloseButtonClick}
            size="small"
            headerActions={(
                <SmartButtonLikeLink
                    route={routes.newReport}
                    attrs={{ projectId }}
                    search={`?analysis=${analysisId}`}
                    spacing="compact"
                    variant="tertiary"
                >
                    Create New Report
                </SmartButtonLikeLink>
            )}
            footerActions={(
                <Pager
                    activePage={activePage}
                    itemsCount={data?.project?.analysisReports?.totalCount ?? 0}
                    onActivePageChange={setActivePage}
                    maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                    itemsPerPageControlHidden
                />
            )}
        >
            <ListView
                renderer={ReportItem}
                rendererParams={reportsRendererParams}
                keySelector={reportsKeySelector}
                data={data?.project?.analysisReports?.results}
                errored={false}
                filtered={false}
                pending={loading}
                emptyMessage="No reports have been created from this analysis"
                messageShown
                messageIconShown
            />
        </Modal>
    );
}

export default ReportsModal;
