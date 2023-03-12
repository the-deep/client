import React, { useMemo, useState, useCallback } from 'react';
import { useQuery, gql } from '@apollo/client';
import { SelectInput } from '@the-deep/deep-ui';
import {
    compareNumber,
    isDefined,
} from '@togglecorp/fujs';

import {
    CompleteTimeseriesQuery,
    CompleteTimeseriesQueryVariables,
    YearlySnapshotsQuery,
    YearlySnapshotQuery,
    YearlySnapshotQueryVariables,
} from '#generated/types';
import {
    DEEP_START_DATE,
    todaysDate,
    lastYearStartDate,
    getMaximum,
} from '#utils/common';
import { resolveTime } from '#utils/temporal';

import ExploreDeepContent from '../ExploreDeepContent';
import { useModalState } from '#hooks/stateManagement';

const COMPLETE_TIMESERIES = gql`
query CompleteTimeseries($pathName: String!) {
    completeTimeseries(pathName: $pathName) @rest(
        type: "CompleteTimeseries!",
        method: "GET",
        endpoint: "static",
        path: ":pathName",
    ) {
        deepExploreStats {
            projectsCountByDay {
                count
                date
            }
            entriesCountByDay {
                count
                date
            }
            leadsCountByDay {
                count
                date
            }
        }
    }
}
`;

const YEARLY_SNAPSHOT = gql`
query YearlySnapshot($pathName: String!) {
    yearlySnapshot(pathName: $pathName) @rest(
        type: "YearlySnapshot!",
        method: "GET",
        endpoint: "static",
        path: ":pathName",
    ) {
        deepExploreStats {
            topTenAuthors {
                id
                title
                projectsCount
                leadsCount
            }
            topTenPublishers {
                id
                title
                projectsCount
                leadsCount
            }
            projectsByRegion {
                id
                centroid
                projectIds
            }
            topTenFrameworks {
                id
                title
                entriesCount
                projectsCount
            }
            topTenProjectsByEntries {
                id
                title
                entriesCount
                leadsCount
            }
            topTenProjectsByLeads {
                id
                title
                entriesCount
                leadsCount
            }
            topTenProjectsByUsers {
                id
                title
                usersCount
            }
            totalActiveUsers
            totalAuthors
            totalEntries
            totalLeads
            totalProjects
            totalPublishers
            totalRegisteredUsers
            totalEntriesAddedLastWeek
            entriesCountByRegion {
                centroid
                count
            }
        }
    }
}
`;

const YEARLY_SNAPSHOTS = gql`
query YearlySnapshots {
    publicDeepExploreYearlySnapshots {
        downloadFile {
            name
            url
        }
        file {
            name
            url
        }
        startDate
        endDate
        type
        globalType
        id
        year
    }
    publicDeepExploreGlobalSnapshots {
        downloadFile {
            name
            url
        }
        file {
            name
            url
        }
        type
        startDate
        endDate
        globalType
        id
        year
    }
}`;

const snapshotKeySelector = (snapshot: { id: string }) => snapshot.id;
const snapshotLabelSelector = (snapshot: {
    year?: number | null | undefined,
    type: 'YEARLY_SNAPSHOT' | 'GLOBAL',
}) => (
    snapshot?.type === 'YEARLY_SNAPSHOT' ? `${snapshot.year}` : 'Global'
);

const lastYearDateTime = resolveTime(lastYearStartDate, 'day').getTime();
const todaysDateTime = resolveTime(todaysDate, 'day').getTime();
const deepStartDateTime = resolveTime(DEEP_START_DATE, 'day').getTime();

interface Props {
    className?: string;
}

function PublicExploreDeep(props: Props) {
    const {
        className,
    } = props;

    const [selectedSnapshot, setSelectedYear] = useState<string | undefined>();

    const [
        startDate = deepStartDateTime,
        setStartDate,
    ] = useState<number | undefined>(
        lastYearDateTime,
    );
    const [
        endDate = todaysDateTime,
        setEndDate,
    ] = useState<number | undefined>(
        todaysDateTime,
    );

    const {
        data,
        loading,
    } = useQuery<YearlySnapshotsQuery>(
        YEARLY_SNAPSHOTS,
        {
            onCompleted: (response) => {
                if (!response || !response.publicDeepExploreYearlySnapshots) {
                    return;
                }
                const latestYear = getMaximum(
                    response.publicDeepExploreYearlySnapshots,
                    (foo, bar) => compareNumber(foo.year, bar.year),
                );
                if (latestYear) {
                    setSelectedYear(latestYear.id);
                    const yearStartDate = new Date(latestYear.startDate).getTime();
                    const yearEndDate = new Date(latestYear.endDate).getTime();
                    setStartDate(yearStartDate);
                    setEndDate(Math.min(yearEndDate, todaysDateTime));
                }
            },
        },
    );

    const snapshotOptions = useMemo(() => (
        [
            ...(data?.publicDeepExploreYearlySnapshots ?? []),
            data?.publicDeepExploreGlobalSnapshots?.find((snapshot) => snapshot.globalType === 'FULL'),
        ].filter(isDefined)
    ), [data]);

    const completeTimeseriesDataEndpoint = useMemo(() => {
        const completeDataNode = data?.publicDeepExploreGlobalSnapshots?.find((node) => node.globalType === 'TIME_SERIES');
        if (!completeDataNode || !completeDataNode.file?.url) {
            return undefined;
        }
        const pathName = new URL(completeDataNode.file.url).pathname;
        return { pathName };
    }, [
        data?.publicDeepExploreGlobalSnapshots,
    ]);

    const {
        data: completeData,
        loading: completeDataLoading,
    } = useQuery<CompleteTimeseriesQuery, CompleteTimeseriesQueryVariables>(
        COMPLETE_TIMESERIES,
        {
            skip: !completeTimeseriesDataEndpoint,
            variables: completeTimeseriesDataEndpoint,
        },
    );

    const {
        selectedSnapshotVariables,
        csvDownloadLink,
        csvDownloadName,
    } = useMemo(() => {
        const selectedSnapshotNode = snapshotOptions
            ?.find((node) => node.id === selectedSnapshot);
        if (!selectedSnapshotNode || !selectedSnapshotNode.file?.url) {
            return {
                selectedSnapshotVariables: undefined,
                csvDownloadLink: undefined,
                csvDownloadName: undefined,
            };
        }
        const pathName = new URL(selectedSnapshotNode.file.url).pathname;
        return ({
            selectedSnapshotVariables: { pathName },
            csvDownloadLink: selectedSnapshotNode.downloadFile?.url,
            csvDownloadName: selectedSnapshotNode.downloadFile?.name,
        });
    }, [
        snapshotOptions,
        selectedSnapshot,
    ]);

    const {
        data: yearlyDataNode,
        loading: yearlyDataLoading,
    } = useQuery<YearlySnapshotQuery, YearlySnapshotQueryVariables>(
        YEARLY_SNAPSHOT,
        {
            skip: !selectedSnapshotVariables,
            variables: selectedSnapshotVariables,
        },
    );
    const yearlyData = yearlyDataNode?.yearlySnapshot?.deepExploreStats;
    const [
        printPreviewMode,
        showPrintPreview,
        hidePrintPreview,
    ] = useModalState(false);

    const handlePrintClick = useCallback(() => {
        window.print();
    }, []);

    const handlePdfExportClick = useCallback(() => {
        showPrintPreview();
    }, [
        showPrintPreview,
    ]);
    const handleExcelExportClick = useCallback(() => {
        if (!csvDownloadLink) {
            return;
        }
        const a = document.createElement('a');
        a.href = csvDownloadLink;
        a.download = csvDownloadName ?? 'DEEP Data Export.csv';
        a.click();
    }, [
        csvDownloadLink,
        csvDownloadName,
    ]);

    const handleSnapshotChange = useCallback((newSnapshotId: string) => {
        setSelectedYear(newSnapshotId);
        const selectedSnapshotNode = snapshotOptions
            ?.find((node) => node.id === newSnapshotId);
        if (!selectedSnapshotNode) {
            return;
        }
        const yearStartDate = new Date(selectedSnapshotNode.startDate).getTime();
        const yearEndDate = new Date(selectedSnapshotNode.endDate).getTime();
        setStartDate(yearStartDate);
        setEndDate(Math.min(yearEndDate, todaysDateTime));
    }, [snapshotOptions]);

    return (
        <ExploreDeepContent
            className={className}
            isPublic
            headerActions={(
                <SelectInput
                    variant="general"
                    name={undefined}
                    options={snapshotOptions}
                    keySelector={snapshotKeySelector}
                    labelSelector={snapshotLabelSelector}
                    onChange={handleSnapshotChange}
                    value={selectedSnapshot}
                    nonClearable
                />
            )}
            printPreviewMode={printPreviewMode}
            onHidePrintPreviewClick={hidePrintPreview}
            onPrintClick={handlePrintClick}
            endDate={endDate}
            startDate={startDate}
            onEndDateChange={setEndDate}
            onStartDateChange={setStartDate}
            onPdfExportClick={handlePdfExportClick}
            onExcelExportClick={handleExcelExportClick}
            filters={undefined}
            exportIdToDownload={undefined}
            onFiltersChange={undefined}
            projectCompleteTimeseries={
                completeData?.completeTimeseries?.deepExploreStats?.projectsCountByDay
            }
            entriesCompleteTimeseries={
                completeData?.completeTimeseries?.deepExploreStats?.entriesCountByDay
            }
            leadsCountByDay={
                completeData?.completeTimeseries?.deepExploreStats?.leadsCountByDay
            }
            entriesCountByRegion={
                yearlyData?.entriesCountByRegion
            }
            totalProjects={yearlyData?.totalProjects}
            totalRegisteredUsers={yearlyData?.totalRegisteredUsers}
            totalActiveUsers={yearlyData?.totalActiveUsers}
            totalLeads={yearlyData?.totalLeads}
            totalAuthors={yearlyData?.totalAuthors}
            totalPublishers={yearlyData?.totalPublishers}
            totalEntries={yearlyData?.totalEntries}
            totalEntriesAddedLastWeek={yearlyData?.totalEntriesAddedLastWeek}
            projectsByRegion={yearlyData?.projectsByRegion}
            topTenAuthors={yearlyData?.topTenAuthors}
            topTenPublishers={yearlyData?.topTenPublishers}
            topTenFrameworks={yearlyData?.topTenFrameworks}
            topTenProjectsByUsers={yearlyData?.topTenProjectsByUsers}
            topTenProjectsByEntries={yearlyData?.topTenProjectsByEntries}
            topTenProjectsByLeads={yearlyData?.topTenProjectsByLeads}
            loadingMapAndLeadData={loading || yearlyDataLoading || completeDataLoading}
            loading={loading || yearlyDataLoading || completeDataLoading}
            // NOTE: Disabling dropdown menu when data is loading
            exportCreatePending={loading || yearlyDataLoading || completeDataLoading}
        />
    );
}

export default PublicExploreDeep;
