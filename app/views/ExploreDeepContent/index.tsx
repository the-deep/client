import React, { useMemo, useState } from 'react';
import {
    isDefined,
    _cs,
    formatDateToString,
} from '@togglecorp/fujs';
import {
    Card,
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

import StatsInformationCard from '#components/StatsInformationCard';

import ProjectFilters, { FormType } from './ProjectFilters';
import ProjectContent from './ProjectContent';
import EntriesContent from './EntriesContent';
import TopTenAuthors, { TopAuthor } from './TopTenAuthors';
import TopTenFrameworks, { TopFrameworks } from './TopTenFrameworks';
import TopTenProjectsByUser, { TopProjectByUser } from './TopTenProjectsByUser';
import TopTenProjectsByEntries, { TopProjectByEntries } from './TopTenProjectsByEntries';

import styles from './styles.css';

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

type ProjectByRegion = {
    id: string;
    centroid?: unknown;
    projectIds?: string[] | null | undefined;
};

interface Props {
    className?: string;
    isPublic?: boolean;
    printPreviewMode: boolean;
    onHidePrintPreviewClick: () => void;
    onPrintClick: () => void;
    onYearChange: (newDate: string | undefined) => void;
    onFromDateChange: (newDate: string | undefined) => void;
    onToDateChange: (newDate: string | undefined) => void;
    endDate: number;
    startDate: number;
    selectedYear: string | undefined;
    onEndDateChange: (newDate: number | undefined) => void;
    onStartDateChange: (newDate: number | undefined) => void;
    onImageExportClick: () => void;
    onPdfExportClick: () => void;
    onExcelExportClick: () => void;
    filters: FormType | undefined;
    onFiltersChange: (newFilters: FormType | undefined) => void;
    totalProjects: number | undefined;
    totalRegisteredUsers: number | undefined;
    totalActiveUsers: number | undefined;
    totalLeads: number | undefined;
    totalAuthors: number | undefined;
    totalPublishers: number | undefined;
    totalEntries: number | undefined;
    totalEntriesAddedLastWeek: number | undefined;
    projectsByRegion: (ProjectByRegion | null | undefined)[] | null | undefined;
    projectCompleteTimeseries: { date: string; count: number }[] | undefined | null;
    entriesCompleteTimeseries: { date: string; count: number }[] | undefined | null;
    leadsCountByDay: { date: string; count: number }[] | undefined | null;
    entriesCountByRegion: { centroid?: unknown; count: number }[] | undefined | null;
    topTenAuthors: TopAuthor[] | undefined | null;
    topTenPublishers: TopAuthor[] | undefined | null;
    topTenFrameworks: TopFrameworks[] | undefined | null;
    topTenProjectsByUsers: TopProjectByUser[] | undefined | null;
    topTenProjectsByEntries: TopProjectByEntries[] | undefined | null;
    loadingMapAndLeadData: boolean;
    exportCreatePending: boolean;
    loading: boolean;
    exportIdToDownload: string | undefined;
}

function ExploreDeepContent(props: Props) {
    const {
        className,
        isPublic = false,
        printPreviewMode,
        onHidePrintPreviewClick,
        onPrintClick,
        onYearChange,
        onFromDateChange,
        onToDateChange,
        endDate,
        startDate,
        selectedYear,
        onEndDateChange,
        onStartDateChange,
        onImageExportClick,
        exportIdToDownload,
        onPdfExportClick,
        onExcelExportClick,
        onFiltersChange,
        totalProjects,
        totalRegisteredUsers,
        totalActiveUsers,
        totalLeads,
        totalAuthors,
        totalPublishers,
        totalEntries,
        totalEntriesAddedLastWeek,
        projectsByRegion: projectsByRegionFromProps,
        projectCompleteTimeseries,
        entriesCompleteTimeseries,
        leadsCountByDay,
        entriesCountByRegion,
        topTenAuthors,
        topTenPublishers,
        topTenFrameworks,
        topTenProjectsByUsers,
        topTenProjectsByEntries,
        loadingMapAndLeadData,
        exportCreatePending,
        filters,
        loading,
    } = props;

    const startDateString = formatDateToString(new Date(startDate), 'yyyy-MM-dd');
    const endDateString = formatDateToString(new Date(endDate), 'yyyy-MM-dd');

    const [representationType, setRepresentationType] = useState<Option['key']>('table');
    //
    // FIXME: Remove this after fixed in server
    const projectsByRegion = useMemo(() => (
        projectsByRegionFromProps?.filter(isDefined) ?? undefined
    ), [projectsByRegionFromProps]);

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
                                onClick={onHidePrintPreviewClick}
                            >
                                Cancel
                            </Button>
                            <Button
                                name={undefined}
                                variant="primary"
                                icons={<IoPrint />}
                                onClick={onPrintClick}
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
                                onChange={onYearChange}
                                value={selectedYear}
                                nonClearable
                            />
                        ) : (
                            <DateDualRangeInput
                                variant="general"
                                fromName="fromDate"
                                fromOnChange={onFromDateChange}
                                fromValue={startDateString}
                                toName="toDate"
                                toOnChange={onToDateChange}
                                toValue={endDateString}
                            />
                        )}
                        <DropdownMenu
                            label="Download"
                            disabled={!!exportIdToDownload || exportCreatePending}
                        >
                            <DropdownMenuItem
                                name={undefined}
                                onClick={onImageExportClick}
                                disabled
                            >
                                Image
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                name={undefined}
                                onClick={onPdfExportClick}
                            >
                                PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                name={undefined}
                                onClick={onExcelExportClick}
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
                                    totalValue={totalProjects}
                                    variant="accent"
                                />
                                <div className={styles.separator} />
                                <StatsInformationCard
                                    className={styles.infoCard}
                                    icon={(
                                        <IoPersonOutline />
                                    )}
                                    label="Users"
                                    totalValue={totalRegisteredUsers}
                                    variant="accent"
                                />
                                <StatsInformationCard
                                    className={styles.infoCard}
                                    icon={(
                                        <IoPersonOutline />
                                    )}
                                    label="Active Users"
                                    totalValue={totalActiveUsers}
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
                                    totalValue={totalLeads}
                                    variant="accent"
                                />
                                <div className={styles.separator} />
                                <StatsInformationCard
                                    className={styles.infoCard}
                                    icon={(
                                        <IoGlobeOutline />
                                    )}
                                    label="Authors"
                                    totalValue={totalAuthors}
                                    variant="accent"
                                />
                                <StatsInformationCard
                                    className={styles.infoCard}
                                    icon={(
                                        <IoGlobeOutline />
                                    )}
                                    label="Publishers"
                                    totalValue={totalPublishers}
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
                                    totalValue={totalEntries}
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
                                    totalValue={totalEntriesAddedLastWeek}
                                    variant="accent"
                                />
                            </Card>
                        </div>
                        {!isPublic && (
                            <ProjectFilters
                                className={styles.filters}
                                initialValue={filters}
                                onFiltersChange={onFiltersChange}
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
                                projectsByRegion={projectsByRegion ?? undefined}
                                readOnlyMode={printPreviewMode}
                                endDate={endDate}
                                startDate={startDate}
                                onEndDateChange={!isPublic ? onEndDateChange : undefined}
                                onStartDateChange={!isPublic ? onStartDateChange : undefined}
                                projectFilters={filters}
                                isPublic={isPublic}
                                completeTimeseries={projectCompleteTimeseries ?? undefined}
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
                                onEndDateChange={!isPublic ? onEndDateChange : undefined}
                                onStartDateChange={!isPublic ? onStartDateChange : undefined}
                                completeTimeseries={entriesCompleteTimeseries ?? undefined}
                                leadsCountByDay={leadsCountByDay ?? undefined}
                                entriesCountByRegion={entriesCountByRegion ?? undefined}
                                loading={loadingMapAndLeadData}
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
                                    onEndDateChange={!isPublic ? onEndDateChange : undefined}
                                    onStartDateChange={!isPublic ? onStartDateChange : undefined}
                                    isPublic={isPublic}
                                    completeTimeseries={projectCompleteTimeseries ?? undefined}
                                />
                            </TabPanel>
                            <TabPanel name="entries">
                                <EntriesContent
                                    endDate={endDate}
                                    startDate={startDate}
                                    onEndDateChange={!isPublic ? onEndDateChange : undefined}
                                    onStartDateChange={!isPublic ? onStartDateChange : undefined}
                                    completeTimeseries={entriesCompleteTimeseries ?? undefined}
                                    leadsCountByDay={leadsCountByDay ?? undefined}
                                    entriesCountByRegion={entriesCountByRegion ?? undefined}
                                    loading={loadingMapAndLeadData}
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
                        data={topTenAuthors}
                        mode={representationType}
                        label="Top Ten Authors"
                    />
                    <TopTenAuthors
                        className={styles.topTenCard}
                        data={topTenPublishers}
                        mode={representationType}
                        label="Top Ten Publishers"
                    />
                    <TopTenFrameworks
                        className={styles.topTenCard}
                        data={topTenFrameworks}
                        mode={representationType}
                        label="Top Ten Frameworks"
                    />
                    <TopTenProjectsByUser
                        className={styles.topTenCard}
                        data={topTenProjectsByUsers}
                        mode={representationType}
                        label="Top Ten Projects (Users)"
                    />
                    <TopTenProjectsByEntries
                        className={styles.topTenCard}
                        data={topTenProjectsByEntries}
                        mode={representationType}
                        label="Top Ten Projects (Entries)"
                    />
                </Container>
            </Container>
        </>
    );
}

export default ExploreDeepContent;
