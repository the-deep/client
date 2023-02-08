import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
    _cs,
    isDefined,
    formatDateToString,
} from '@togglecorp/fujs';
import {
    Card,
    useAlert,
    AlertContext,
    Element,
    Heading,
    Container,
    Button,
    SegmentInput,
    DateDualRangeInput,
    DropdownMenu,
    DropdownMenuItem,
    SelectInput,
    Tab,
    TabPanel,
    Tabs,
    ButtonLikeLink,
} from '@the-deep/deep-ui';
import {
    IoPrint,
    IoClose,
    IoLayersOutline,
    IoTimeOutline,
    IoListOutline,
    IoBarChartOutline,
    IoGlobeOutline,
    IoDocumentOutline,
    IoPersonOutline,
} from 'react-icons/io5';
import { AiOutlineLoading } from 'react-icons/ai';
import { useMutation, useQuery, gql } from '@apollo/client';

import StatsInformationCard from '#components/StatsInformationCard';
import {
    ExploreDeepStatsQuery,
    ExploreDeepStatsQueryVariables,
    GenericExportCreateMutation,
    GenericExportCreateMutationVariables,
    GenericExportQuery,
    GenericExportQueryVariables,
} from '#generated/types';
import { useModalState } from '#hooks/stateManagement';
import {
    DEEP_START_DATE,
    todaysDate,
    lastYearStartDate,
    convertDateToIsoDateTime,
} from '#utils/common';
import { resolveTime } from '#utils/temporal';

import ProjectFilters, { FormType } from './ProjectFilters';
import ProjectContent from './ProjectContent';
import EntriesContent from './EntriesContent';
import TopTenAuthors from './TopTenAuthors';
import TopTenFrameworks from './TopTenFrameworks';
import TopTenProjectsByUser from './TopTenProjectsByUser';
import TopTenProjectsByEntries from './TopTenProjectsByEntries';

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
        # FIXME: Enable this
        # $excludeEntryLessThan: Boolean,
        $isTest: Boolean,
        $organizations: [ID!],
        $regions: [ID!],
        $search: String,
    ) {
        genericExportCreate(data: {
            filters: {
                entry: {
                    createdAtGte: $dateFrom,
                    createdAtLte: $dateTo,
                },
                lead: {
                    createdAtGte: $dateFrom,
                    createdAtLte: $dateTo,
                },
                project: {
                    createdAtGte: $dateFrom,
                    createdAtLte: $dateTo,
                    organizations: $organizations,
                    regions: $regions,
                    search: $search,
                    isTest: $isTest,
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

interface Option {
    key: 'table' | 'chart';
    label: React.ReactNode;
}

const representationKeySelector = (d: Option) => d.key;
const representationLabelSelector = (d: Option) => d.label;

const representationOptions: Option[] = [
    {
        key: 'table',
        label: <IoListOutline />,
    },
    {
        key: 'chart',
        label: <IoBarChartOutline />,
    },
];

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

const yearKeySelector = (year: TimeOption) => year.key;
const yearLabelSelector = (year: TimeOption) => year.label;

const lastYearDateTime = resolveTime(lastYearStartDate, 'day');
const todaysDateTime = resolveTime(todaysDate, 'day');
const deepStartDateTime = resolveTime(DEEP_START_DATE, 'day');

interface Props {
    className?: string;
    isPublic?: boolean;
}

function NewExploreDeep(props: Props) {
    const {
        className,
        isPublic = false,
    } = props;

    const {
        addAlert,
        removeAlert,
        updateAlertContent,
    } = useContext(AlertContext);

    const [selectedYear, setSelectedYear] = useState<string | undefined>(yearOptions[0].key);

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

    const handleYearChange = useCallback((newYear: string | undefined) => {
        setSelectedYear(newYear);
        const selectedYearData = yearOptions.find((year) => year.key === newYear);
        setEndDate(selectedYearData?.endDate);
        setStartDate(selectedYearData?.startDate);
    }, []);

    const handleEndDateChange = useCallback((newDate: number | undefined) => {
        if (isDefined(newDate)) {
            setEndDate(Math.min(newDate, todaysDateTime));
        } else {
            setEndDate(undefined);
        }
    }, []);

    const handleFromDateChange = useCallback((newDate: string | undefined) => {
        if (isDefined(newDate)) {
            handleEndDateChange(new Date(newDate).getTime());
        } else {
            handleEndDateChange(undefined);
        }
    }, [handleEndDateChange]);

    const handleStartDateChange = useCallback((newDate: number | undefined) => {
        if (isDefined(newDate)) {
            setStartDate(Math.max(newDate, deepStartDateTime));
        } else {
            setStartDate(undefined);
        }
    }, []);

    const handleToDateChange = useCallback((newDate: string | undefined) => {
        if (isDefined(newDate)) {
            handleStartDateChange(new Date(newDate).getTime());
        } else {
            handleStartDateChange(undefined);
        }
    }, [handleStartDateChange]);
    const startDateString = formatDateToString(new Date(startDate), 'yyyy-MM-dd');
    const endDateString = formatDateToString(new Date(endDate), 'yyyy-MM-dd');

    const [filters, setFilters] = useState<FormType | undefined>(undefined);
    const [
        exportIdToDownload,
        setExportIdToDownload,
    ] = useState<string | undefined>();
    const [representationType, setRepresentationType] = useState<Option['key']>('table');
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
        excludeEntryLessThan: !filters?.excludeProjectsLessThan,
    }), [filters, startDate, endDate]);

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

    const {
        data: genericExportData,
        startPolling,
        stopPolling,
    } = useQuery<GenericExportQuery, GenericExportQueryVariables>(
        GENERIC_EXPORT,
        {
            skip: !exportIdToDownload,
            variables: exportIdToDownload ? {
                id: exportIdToDownload,
            } : undefined,
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
                if (response.genericExport.status === 'SUCCESS') {
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
                } else if (response.genericExport.status === 'FAILURE') {
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
            const shouldPoll = exportIdToDownload
                && genericExportData?.genericExport?.status !== 'SUCCESS'
                && genericExportData?.genericExport?.status !== 'FAILURE';

            if (shouldPoll) {
                startPolling(5000);
            } else {
                stopPolling();
            }
        },
        [
            removeAlert,
            exportIdToDownload,
            genericExportData,
            startPolling,
            stopPolling,
        ],
    );

    const handleImageExportClick = useCallback(() => {
        // FIXME: Implement JPEG Export
        showPrintPreview();
    }, [
        showPrintPreview,
    ]);

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

    // FIXME: Remove this after fixed in server
    const projectsByRegion = useMemo(() => (
        data?.deepExploreStats?.projectsByRegion
            ?.filter(isDefined) ?? undefined
    ), [data?.deepExploreStats?.projectsByRegion]);

    const handlePrintClick = useCallback(() => {
        window.print();
    }, []);

    return (
        <>
            {printPreviewMode && (
                <Element
                    icons={<Heading size="small">Print Preview</Heading>}
                    className={styles.printPreviewBar}
                    actions={(
                        <>
                            <Button
                                name={undefined}
                                variant="secondary"
                                icons={<IoClose />}
                                onClick={hidePrintPreview}
                            >
                                Cancel
                            </Button>
                            <Button
                                name={undefined}
                                variant="primary"
                                icons={<IoPrint />}
                                onClick={handlePrintClick}
                            >
                                Print
                            </Button>
                        </>
                    )}
                >
                    Please update scale of printing to fit your needs.
                </Element>
            )}
            <Container
                className={_cs(
                    styles.exploreDeep,
                    className,
                    printPreviewMode && styles.printPreviewMode,
                )}
                contentClassName={styles.content}
                headerClassName={styles.header}
                heading="Explore DEEP"
                spacing="loose"
                inlineHeadingDescription
                headingDescriptionClassName={styles.headingDescription}
                headingDescription={(
                    <>
                        <Heading
                            className={styles.dateRangeOutput}
                            size="small"
                        >
                            {`(${startDateString} - ${endDateString})`}
                        </Heading>
                        {loading && <AiOutlineLoading className={styles.loading} />}
                    </>
                )}
                headerActions={!printPreviewMode && (
                    <>
                        {isPublic ? (
                            <SelectInput
                                className={styles.yearSelectionInput}
                                variant="general"
                                name={undefined}
                                options={yearOptions}
                                keySelector={yearKeySelector}
                                labelSelector={yearLabelSelector}
                                onChange={handleYearChange}
                                value={selectedYear}
                                nonClearable
                            />
                        ) : (
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
                        <DropdownMenu
                            label="Download"
                            disabled={!!exportIdToDownload || exportCreatePending}
                        >
                            <DropdownMenuItem
                                name={undefined}
                                onClick={handleImageExportClick}
                                disabled
                            >
                                Image
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                name={undefined}
                                onClick={handlePdfExportClick}
                            >
                                PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                name={undefined}
                                onClick={handleExcelExportClick}
                            >
                                CSV
                            </DropdownMenuItem>
                        </DropdownMenu>
                    </>
                )}
                headerDescriptionClassName={styles.headerDescription}
                headerDescription={(
                    <>
                        <div className={styles.statsContainer}>
                            <Card className={_cs(styles.statCard, styles.projectStatsCard)}>
                                <StatsInformationCard
                                    className={styles.infoCard}
                                    icon={(
                                        <IoDocumentOutline />
                                    )}
                                    label="Projects"
                                    totalValue={data?.deepExploreStats?.totalProjects}
                                    variant="accent"
                                />
                                <div className={styles.separator} />
                                <StatsInformationCard
                                    className={styles.infoCard}
                                    icon={(
                                        <IoPersonOutline />
                                    )}
                                    label="Users"
                                    totalValue={data?.deepExploreStats?.totalRegisteredUsers}
                                    variant="accent"
                                />
                                <StatsInformationCard
                                    className={styles.infoCard}
                                    icon={(
                                        <IoPersonOutline />
                                    )}
                                    label="Active Users"
                                    totalValue={data?.deepExploreStats?.totalActiveUsers}
                                    variant="accent"
                                />
                            </Card>
                            <Card className={_cs(styles.statCard, styles.sourceStatsCard)}>
                                <StatsInformationCard
                                    className={styles.infoCard}
                                    icon={(
                                        <IoDocumentOutline />
                                    )}
                                    label="Sources"
                                    totalValue={data?.deepExploreStats?.totalLeads}
                                    variant="accent"
                                />
                                <div className={styles.separator} />
                                <StatsInformationCard
                                    className={styles.infoCard}
                                    icon={(
                                        <IoGlobeOutline />
                                    )}
                                    label="Authors"
                                    totalValue={data?.deepExploreStats?.totalAuthors}
                                    variant="accent"
                                />
                                <StatsInformationCard
                                    className={styles.infoCard}
                                    icon={(
                                        <IoGlobeOutline />
                                    )}
                                    label="Publishers"
                                    totalValue={data?.deepExploreStats?.totalPublishers}
                                    variant="accent"
                                />
                            </Card>
                            <Card className={_cs(styles.statCard, styles.entryStatsCard)}>
                                <StatsInformationCard
                                    className={styles.infoCard}
                                    icon={(
                                        <IoLayersOutline />
                                    )}
                                    label="Entries"
                                    totalValue={data?.deepExploreStats?.totalEntries}
                                    variant="accent"
                                />
                                <div className={styles.separator} />
                                <StatsInformationCard
                                    className={styles.infoCard}
                                    icon={(
                                        <IoTimeOutline />
                                    )}
                                    label="Added last week"
                                    // TODO: Get entries last week
                                    totalValue={data?.deepExploreStats?.totalEntriesAddedLastWeek}
                                    variant="accent"
                                />
                            </Card>
                        </div>
                        {!isPublic && (
                            <ProjectFilters
                                className={styles.filters}
                                initialValue={filters}
                                onFiltersChange={setFilters}
                                readOnlyMode={printPreviewMode}
                            />
                        )}
                    </>
                )}
                headingSize="large"
            >
                {printPreviewMode ? (
                    <>
                        <Container
                            heading="Projects"
                            headingSize="small"
                            headerClassName={styles.sectionHeader}
                            spacing="none"
                        >
                            <ProjectContent
                                projectsByRegion={projectsByRegion}
                                readOnlyMode={printPreviewMode}
                                endDate={endDate}
                                startDate={startDate}
                                onEndDateChange={!isPublic ? setEndDate : undefined}
                                onStartDateChange={!isPublic ? setStartDate : undefined}
                                projectFilters={filters}
                                isPublic={isPublic}
                            />
                        </Container>
                        <Container
                            heading="Entries / Sources"
                            headerClassName={styles.sectionHeader}
                            headingSize="small"
                            spacing="none"
                        >
                            <EntriesContent
                                endDate={endDate}
                                startDate={startDate}
                                onEndDateChange={!isPublic ? setEndDate : undefined}
                                onStartDateChange={!isPublic ? setStartDate : undefined}
                                projectFilters={filters}
                            />
                        </Container>
                    </>
                ) : (
                    <Tabs
                        defaultHash="projects"
                        useHash
                    >
                        <div className={styles.topContainer}>
                            <div className={styles.contentHeader}>
                                <Tab
                                    name="projects"
                                    transparentBorder
                                >
                                    Projects
                                </Tab>
                                <Tab
                                    name="entries"
                                    transparentBorder
                                >
                                    Entries / Sources
                                </Tab>
                            </div>
                            <TabPanel name="projects">
                                <ProjectContent
                                    projectsByRegion={projectsByRegion}
                                    readOnlyMode={printPreviewMode}
                                    endDate={endDate}
                                    startDate={startDate}
                                    projectFilters={filters}
                                    onEndDateChange={!isPublic ? setEndDate : undefined}
                                    onStartDateChange={!isPublic ? setStartDate : undefined}
                                    isPublic={isPublic}
                                />
                            </TabPanel>
                            <TabPanel name="entries">
                                <EntriesContent
                                    endDate={endDate}
                                    startDate={startDate}
                                    onEndDateChange={!isPublic ? setEndDate : undefined}
                                    onStartDateChange={!isPublic ? setStartDate : undefined}
                                    projectFilters={filters}
                                />
                            </TabPanel>
                        </div>
                    </Tabs>
                )}
                <Container
                    className={styles.bottomContainer}
                    headerActions={!printPreviewMode && (
                        <SegmentInput
                            className={className}
                            name={undefined}
                            onChange={setRepresentationType}
                            options={representationOptions}
                            keySelector={representationKeySelector}
                            labelSelector={representationLabelSelector}
                            value={representationType}
                        />
                    )}
                    contentClassName={styles.bottomContainerContent}
                >
                    <TopTenAuthors
                        className={styles.topTenCard}
                        data={data?.deepExploreStats?.topTenAuthors}
                        mode={representationType}
                        label="Top Ten Authors"
                    />
                    <TopTenAuthors
                        className={styles.topTenCard}
                        data={data?.deepExploreStats?.topTenPublishers}
                        mode={representationType}
                        label="Top Ten Publishers"
                    />
                    <TopTenFrameworks
                        className={styles.topTenCard}
                        data={data?.deepExploreStats?.topTenFrameworks}
                        mode={representationType}
                        label="Top Ten Frameworks"
                    />
                    <TopTenProjectsByUser
                        className={styles.topTenCard}
                        data={data?.deepExploreStats?.topTenProjectsByUsers}
                        mode={representationType}
                        label="Top Ten Projects (Users)"
                    />
                    <TopTenProjectsByEntries
                        className={styles.topTenCard}
                        data={data?.deepExploreStats?.topTenProjectsByEntries}
                        mode={representationType}
                        label="Top Ten Projects (Entries)"
                    />
                </Container>
            </Container>
        </>
    );
}

export default NewExploreDeep;
