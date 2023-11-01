import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
    isDefined,
    randomString,
    formatDateToString,
} from '@togglecorp/fujs';
import {
    useHash,
    useAlert,
    AlertContext,
    DateDualRangeInput,
    ButtonLikeLink,
} from '@the-deep/deep-ui';
import { useMutation, useQuery, gql } from '@apollo/client';

import {
    ExploreDeepStatsQuery,
    ExploreDeepStatsQueryVariables,
    GenericExportCreateMutation,
    GenericExportCreateMutationVariables,
    GenericExportQuery,
    GenericExportQueryVariables,
    EntriesCountTimeseriesQuery,
    EntriesCountTimeseriesQueryVariables,
    EntriesMapDataQuery,
    EntriesMapDataQueryVariables,
    ProjectCountTimeseriesQuery,
    ProjectCountTimeseriesQueryVariables,
} from '#generated/types';
import { useModalState } from '#hooks/stateManagement';
import {
    DEEP_START_DATE,
    todaysDate,
    lastYearStartDate,
    convertDateToIsoDateTime,
} from '#utils/common';
import { resolveTime } from '#utils/temporal';

import { FormType } from '../ExploreDeepContent/ProjectFilters';
import ExploreDeepContent from '../ExploreDeepContent';

import styles from './styles.css';

const DOWNLOAD_ALERT_NAME = 'generic-export-download';

const EXPLORE_DEEP_STATS = gql`
query ExploreDeepStats(
    $dateFrom: DateTime!,
    $dateTo: DateTime!,
    $excludeEntryLessThan: Boolean,
    $isTest: Boolean,
    $organizations: [ID!],
    $regions: [ID!],
    $search: String,
) {
    deepExploreStats(
        filter: {
            dateFrom: $dateFrom,
            dateTo: $dateTo,
            project: {
                excludeEntryLessThan: $excludeEntryLessThan,
                isTest: $isTest,
                organizations: $organizations,
                regions: $regions,
                search: $search,
            },
        }
    ) {
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
    }
}`;

const ENTRIES_COUNT_TIMESERIES = gql`
query EntriesCountTimeseries(
    $dateFrom: DateTime!,
    $dateTo: DateTime!,
    $excludeEntryLessThan: Boolean,
    $isTest: Boolean,
    $organizations: [ID!],
    $regions: [ID!],
    $search: String,
) {
    deepExploreStats(
        filter: {
            dateFrom: $dateFrom,
            dateTo: $dateTo,
            project: {
                excludeEntryLessThan: $excludeEntryLessThan,
                isTest: $isTest,
                organizations: $organizations,
                regions: $regions,
                search: $search,
            },
        }
    ) {
        entriesCountByDay {
            date
            count
        }
    }
}`;

const ENTRIES_MAP_DATA = gql`
query EntriesMapData(
    $dateFrom: DateTime!,
    $dateTo: DateTime!,
    $excludeEntryLessThan: Boolean,
    $isTest: Boolean,
    $organizations: [ID!],
    $regions: [ID!],
    $search: String,
) {
    deepExploreStats(
        filter: {
            dateFrom: $dateFrom,
            dateTo: $dateTo,
            project: {
                excludeEntryLessThan: $excludeEntryLessThan,
                isTest: $isTest,
                organizations: $organizations,
                regions: $regions,
                search: $search,
            },
        }
    ) {
        leadsCountByDay {
            date
            count
        }
        entriesCountByRegion {
            centroid
            count
        }
    }
}`;

const PROJECT_COUNT_TIMESERIES = gql`
    query ProjectCountTimeseries(
        $dateFrom: DateTime!,
        $dateTo: DateTime!,
        $excludeEntryLessThan: Boolean,
        $isTest: Boolean,
        $organizations: [ID!],
        $regions: [ID!],
        $search: String,
    ) {
        deepExploreStats(
            filter: {
                dateFrom: $dateFrom,
                dateTo: $dateTo,
                project: {
                    excludeEntryLessThan: $excludeEntryLessThan,
                    isTest: $isTest,
                    organizations: $organizations,
                    regions: $regions,
                    search: $search,
                },
            }
        ) {
            projectsCountByDay {
                date
                count
            }
        }
    }
`;

const GENERIC_EXPORT = gql`
    query GenericExport(
        $id: ID!,
    ) {
        genericExport(id: $id) {
            id
            status
            fileDownloadUrl
        }
    }
`;

const GENERIC_EXPORT_CREATE = gql`
    mutation GenericExportCreate(
        $dateFrom: DateTime!,
        $dateTo: DateTime!,
        $excludeEntryLessThan: Boolean,
        $isTest: Boolean,
        $organizations: [ID!],
        $regions: [ID!],
        $search: String,
    ) {
        genericExportCreate(data: {
            filters: {
                deepExplore: {
                    dateFrom: $dateFrom,
                    dateTo: $dateTo,
                    project: {
                        createdAtGte: $dateFrom,
                        createdAtLte: $dateTo,
                        organizations: $organizations,
                        excludeEntryLessThan: $excludeEntryLessThan,
                        regions: $regions,
                        search: $search,
                        isTest: $isTest,
                    },
                },
            },
            format: CSV,
            type: PROJECTS_STATS,
        }) {
            ok
            errors
            result {
                id
                status
            }
        }
    }
`;

interface TimeOption {
    key: string;
    label: string;
    startDate: number;
    endDate: number;
}

// TODO: Fetch this later from server
const yearOptions: TimeOption[] = [
    {
        key: '2022',
        label: '2022',
        startDate: 1640974500000,
        endDate: 1672424100000,
    },
    {
        key: '2021',
        label: '2021',
        startDate: 1609438500000,
        endDate: 1640888100000,
    },
    {
        key: '2020',
        label: '2020',
        startDate: 1577816100000,
        endDate: 1609352100000,
    },
    {
        key: '2019',
        label: '2019',
        startDate: 1546280100000,
        endDate: 1577729700000,
    },
    {
        key: '2018',
        label: '2018',
        startDate: 1514744100000,
        endDate: 1546193700000,
    },
];

const lastYearDateTime = resolveTime(lastYearStartDate, 'day').getTime();
const todaysDateTime = resolveTime(todaysDate, 'day').getTime();
const deepStartDateTime = resolveTime(DEEP_START_DATE, 'day').getTime();

interface Props {
    className?: string;
    isPublic?: boolean;
}

function ExploreDeep(props: Props) {
    const {
        className,
        isPublic = false,
    } = props;

    const {
        addAlert,
        removeAlert,
        updateAlertContent,
    } = useContext(AlertContext);

    const activeView = useHash();

    const [
        startDate = deepStartDateTime,
        setStartDate,
    ] = useState<number | undefined>(
        () => (!isPublic ? lastYearDateTime : yearOptions[0].startDate),
    );
    const [
        endDate = todaysDateTime,
        setEndDate,
    ] = useState<number | undefined>(
        () => (!isPublic ? todaysDateTime : yearOptions[0].endDate),
    );

    const handleEndDateChange = useCallback((newDate: number | undefined) => {
        if (isDefined(newDate)) {
            setEndDate(Math.min(newDate, todaysDateTime));
        } else {
            setEndDate(undefined);
        }
    }, []);

    const handleStartDateChange = useCallback((newDate: number | undefined) => {
        if (isDefined(newDate)) {
            setStartDate(Math.max(newDate, deepStartDateTime));
        } else {
            setStartDate(undefined);
        }
    }, []);

    const handleFromDateChange = useCallback((newDate: string | undefined) => {
        if (isDefined(newDate)) {
            handleStartDateChange(new Date(newDate).getTime());
        } else {
            handleStartDateChange(undefined);
        }
    }, [handleStartDateChange]);

    const handleToDateChange = useCallback((newDate: string | undefined) => {
        if (isDefined(newDate)) {
            handleEndDateChange(new Date(newDate).getTime());
        } else {
            handleEndDateChange(undefined);
        }
    }, [handleEndDateChange]);

    const [filters, setFilters] = useState<FormType | undefined>(undefined);
    const [
        exportIdToDownload,
        setExportIdToDownload,
    ] = useState<string | undefined>();
    const [
        printPreviewMode,
        showPrintPreview,
        hidePrintPreview,
    ] = useModalState(false);

    const variables: ExploreDeepStatsQueryVariables = useMemo(() => ({
        dateFrom: convertDateToIsoDateTime(new Date(startDate)),
        dateTo: convertDateToIsoDateTime(new Date(endDate), { endOfDay: true }),
        search: filters?.search,
        isTest: filters?.excludeTestProject ? false : undefined,
        organizations: filters?.organizations,
        regions: filters?.regions,
        excludeEntryLessThan: filters?.excludeProjectsLessThan,
    }), [filters, startDate, endDate]);

    const completeTimeseriesVariables: EntriesCountTimeseriesQueryVariables = useMemo(() => ({
        dateFrom: convertDateToIsoDateTime(DEEP_START_DATE),
        dateTo: convertDateToIsoDateTime(todaysDate, { endOfDay: true }),
        search: filters?.search,
        isTest: filters?.excludeTestProject ? false : undefined,
        organizations: filters?.organizations,
        regions: filters?.regions,
        excludeEntryLessThan: filters?.excludeProjectsLessThan,
    }), [filters]);

    const {
        previousData: previousEntriesTimeseriesData,
        data: entriesTimeseriesData = previousEntriesTimeseriesData,
    } = useQuery<EntriesCountTimeseriesQuery, EntriesCountTimeseriesQueryVariables>(
        ENTRIES_COUNT_TIMESERIES,
        {
            skip: !printPreviewMode && activeView !== 'entries',
            variables: completeTimeseriesVariables,
        },
    );

    const {
        previousData: previousProjectsTimeseriesData,
        data: projectsTimeseriesData = previousProjectsTimeseriesData,
    } = useQuery<ProjectCountTimeseriesQuery, ProjectCountTimeseriesQueryVariables>(
        PROJECT_COUNT_TIMESERIES,
        {
            skip: !printPreviewMode && activeView !== 'projects',
            variables: completeTimeseriesVariables,
        },
    );

    const {
        previousData: previousEntriesMapData,
        data: entriesMapData = previousEntriesMapData,
        loading: loadingMapAndLeadData,
    } = useQuery<EntriesMapDataQuery, EntriesMapDataQueryVariables>(
        ENTRIES_MAP_DATA,
        {
            skip: !printPreviewMode && activeView !== 'entries',
            variables,
        },
    );

    const alert = useAlert();
    const {
        previousData,
        data = previousData,
        loading,
    } = useQuery<ExploreDeepStatsQuery, ExploreDeepStatsQueryVariables>(
        EXPLORE_DEEP_STATS,
        {
            variables,
        },
    );
    // FIXME: randomId is used to create different query variables after each poll
    // so that apollo doesn't create unnecessary cache
    const [randomId, setRandomId] = useState<string>(randomString());

    const queryVariables = useMemo(() => (
        exportIdToDownload ? ({
            id: exportIdToDownload,
            randomId,
        }) : undefined
    ), [
        exportIdToDownload,
        randomId,
    ]);

    const {
        data: genericExportData,
        refetch,
    } = useQuery<GenericExportQuery, GenericExportQueryVariables>(
        GENERIC_EXPORT,
        {
            skip: !queryVariables,
            variables: queryVariables,
            onCompleted: (response) => {
                if (!response?.genericExport) {
                    setExportIdToDownload(undefined);
                    removeAlert(DOWNLOAD_ALERT_NAME);
                    alert.show(
                        'There was an issue creating the export.',
                        { variant: 'error' },
                    );
                    // eslint-disable-next-line no-console
                    console.error(response);
                }
                if (response.genericExport?.status === 'SUCCESS') {
                    setExportIdToDownload(undefined);
                    updateAlertContent(DOWNLOAD_ALERT_NAME, (
                        <div className={styles.exportNotificationBody}>
                            Export successfully created
                            <ButtonLikeLink
                                to={response?.genericExport?.fileDownloadUrl ?? ''}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="secondary"
                                spacing="compact"
                            >
                                Download
                            </ButtonLikeLink>
                        </div>
                    ));
                } else if (response.genericExport?.status === 'FAILURE') {
                    removeAlert(DOWNLOAD_ALERT_NAME);
                    setExportIdToDownload(undefined);
                    alert.show(
                        'There was an issue creating the export.',
                        { variant: 'error' },
                    );
                    // eslint-disable-next-line no-console
                    console.error(response);
                }
            },
        },
    );

    const [
        createExport,
        { loading: exportCreatePending },
    ] = useMutation<GenericExportCreateMutation, GenericExportCreateMutationVariables>(
        GENERIC_EXPORT_CREATE,
        {
            onCompleted: (response) => {
                if (!response?.genericExportCreate || !response?.genericExportCreate?.ok) {
                    alert.show(
                        'There was an issue creating the export.',
                        { variant: 'error' },
                    );
                    // eslint-disable-next-line no-console
                    console.error(response);
                    setExportIdToDownload(undefined);
                }
                if (
                    response?.genericExportCreate?.ok
                    && response?.genericExportCreate?.result?.id
                ) {
                    setExportIdToDownload(response.genericExportCreate.result.id);
                    addAlert({
                        variant: 'info',
                        duration: Infinity,
                        name: DOWNLOAD_ALERT_NAME,
                        children: 'Please wait while the export is being prepared.',
                    });
                }
            },
            onError: (gqlError) => {
                alert.show(
                    'There was an issue creating the export.',
                    { variant: 'error' },
                );
                // eslint-disable-next-line no-console
                console.error(gqlError);
                setExportIdToDownload(undefined);
            },
        },
    );

    useEffect(
        () => {
            const timeout = setTimeout(
                () => {
                    const shouldPoll = genericExportData?.genericExport?.status === 'PENDING'
                    || genericExportData?.genericExport?.status === 'STARTED';

                    if (shouldPoll) {
                        setRandomId(randomString());
                        refetch();
                    }
                },
                2000,
            );

            return () => {
                clearTimeout(timeout);
            };
        },
        [
            genericExportData,
            refetch,
        ],
    );

    const handlePdfExportClick = useCallback(() => {
        showPrintPreview();
    }, [
        showPrintPreview,
    ]);

    const handleExcelExportClick = useCallback(() => {
        createExport({
            variables: {
                dateFrom: convertDateToIsoDateTime(new Date(startDate)),
                dateTo: convertDateToIsoDateTime(new Date(endDate), { endOfDay: true }),
                search: filters?.search,
                isTest: filters?.excludeTestProject ? false : undefined,
                organizations: filters?.organizations,
                regions: filters?.regions,
                // excludeEntryLessThan: filters?.excludeProjectsLessThan,
            },
        });
    }, [
        startDate,
        endDate,
        filters,
        createExport,
    ]);

    const handlePrintClick = useCallback(() => {
        window.print();
    }, []);

    const startDateString = formatDateToString(new Date(startDate), 'yyyy-MM-dd');
    const endDateString = formatDateToString(new Date(endDate), 'yyyy-MM-dd');

    return (
        <ExploreDeepContent
            className={className}
            isPublic={isPublic}
            headerActions={(
                <DateDualRangeInput
                    variant="general"
                    fromName="fromDate"
                    fromOnChange={handleFromDateChange}
                    fromValue={startDateString}
                    toName="toDate"
                    toOnChange={handleToDateChange}
                    toValue={endDateString}
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
            filters={filters}
            exportIdToDownload={exportIdToDownload}
            onFiltersChange={setFilters}
            totalProjects={data?.deepExploreStats?.totalProjects}
            totalRegisteredUsers={data?.deepExploreStats?.totalRegisteredUsers}
            totalActiveUsers={data?.deepExploreStats?.totalActiveUsers}
            totalLeads={data?.deepExploreStats?.totalLeads}
            totalAuthors={data?.deepExploreStats?.totalAuthors}
            totalPublishers={data?.deepExploreStats?.totalPublishers}
            totalEntries={data?.deepExploreStats?.totalEntries}
            totalEntriesAddedLastWeek={data?.deepExploreStats?.totalEntriesAddedLastWeek}
            projectsByRegion={data?.deepExploreStats?.projectsByRegion}
            projectCompleteTimeseries={projectsTimeseriesData?.deepExploreStats?.projectsCountByDay}
            entriesCompleteTimeseries={entriesTimeseriesData?.deepExploreStats?.entriesCountByDay}
            leadsCountByDay={entriesMapData?.deepExploreStats?.leadsCountByDay}
            entriesCountByRegion={entriesMapData?.deepExploreStats?.entriesCountByRegion}
            topTenAuthors={data?.deepExploreStats?.topTenAuthors}
            topTenPublishers={data?.deepExploreStats?.topTenPublishers}
            topTenFrameworks={data?.deepExploreStats?.topTenFrameworks}
            topTenProjectsByUsers={data?.deepExploreStats?.topTenProjectsByUsers}
            topTenProjectsByEntries={data?.deepExploreStats?.topTenProjectsByEntries}
            topTenProjectsByLeads={data?.deepExploreStats?.topTenProjectsByLeads}
            loadingMapAndLeadData={loadingMapAndLeadData}
            exportCreatePending={exportCreatePending}
            loading={loading}
        />
    );
}

export default ExploreDeep;
