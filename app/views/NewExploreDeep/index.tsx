import React, { useMemo, useState, useCallback } from 'react';
import {
    _cs,
    formatDateToString,
} from '@togglecorp/fujs';
import {
    Card,
    Container,
    PendingMessage,
    SegmentInput,
    DateDualRangeInput,
    DropdownMenu,
    DropdownMenuItem,
    Tab,
    TabPanel,
    Tabs,
} from '@the-deep/deep-ui';
import {
    IoLayers,
    IoTimeSharp,
    IoListOutline,
    IoBarChartOutline,
    IoGlobe,
    IoDocument,
    IoPerson,
    IoWalk,
} from 'react-icons/io5';
import { useQuery, gql } from '@apollo/client';

import StatsInformationCard from '#components/StatsInformationCard';
import {
    ExploreDeepStatsQuery,
    ExploreDeepStatsQueryVariables,
} from '#generated/types';

import ProjectFilters, { FormType } from './ProjectFilters';
import ProjectContent from './ProjectContent';
import EntriesContent from './EntriesContent';
import TopTenAuthors from './TopTenAuthors';
import TopTenFrameworks from './TopTenFrameworks';
import TopTenProjectsByUser from './TopTenProjectsByUser';
import TopTenProjectsByEntries from './TopTenProjectsByEntries';

import styles from './styles.css';

const DEEP_START_DATE = '2018-01-01';

const EXPLORE_DEEP_STATS = gql`
query ExploreDeepStats(
    $dateFrom: Date!,
    $dateTo: Date!,
    $includeEntryLessThan: Boolean,
    $includeTestProject: Boolean,
    $organizations: [ID!],
    $regions: [ID!],
    $search: String,
) {
    deepExploreStats(
        filter: {
            dateFrom: $dateFrom,
            dateTo: $dateTo,
            project: {
                includeEntryLessThan: $includeEntryLessThan,
                includeTestProject: $includeTestProject,
                organizations: $organizations,
                regions: $regions,
                search: $search,
            },
        }
    ) {
        projectAggregationDaily {
            date
            projectCount
        }
        topTenAuthors {
            id
            title
            verified
            shortName
            mergedAs {
                id
                title
                shortName
            }
            projectCount
            sourceCount
        }
        projectByRegion {
            id
            centroid
            projectsId
        }
        topTenFrameworks {
            analysisFrameworkId
            entryCount
            projectCount
            analysisFrameworkTitle
        }
        topTenProjectEntries {
            entryCount
            sourceCount
            projectTitle
            projectId
        }
        topTenProjectUsers {
            projectId
            projectTitle
            userCount
        }
        totalActiveUsers
        totalAuthors
        totalEntries
        totalLeads
        totalProjects
        totalPublishers
        totalRegisteredUsers
    }
}`;

interface Option {
    key: 'table' | 'chart';
    label: React.ReactNode;
}

const representationKeySelector = (d: Option) => d.key;
const representationLabelSelector = (d: Option) => d.label;

const todaysDate = formatDateToString(new Date(), 'yyyy-MM-dd');

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

interface Props {
    className?: string;
}

function NewExploreDeep(props: Props) {
    const {
        className,
    } = props;

    const [
        startDate = DEEP_START_DATE,
        setStartDate,
    ] = useState<string | undefined>(DEEP_START_DATE);
    const [endDate, setEndDate] = useState<string | undefined>(todaysDate);
    const [filters, setFilters] = useState<FormType | undefined>(undefined);
    const [representationType, setRepresentationType] = useState<Option['key']>('table');

    const variables: ExploreDeepStatsQueryVariables = useMemo(() => ({
        dateFrom: startDate,
        dateTo: endDate ?? todaysDate,
        search: filters?.search,
        includeTestProject: !filters?.excludeTestProject,
        organizations: filters?.organizations,
        regions: filters?.regions,
        includeEntryLessThan: !filters?.excludeProjectsLessThan,
    }), [filters, startDate, endDate]);

    const {
        data,
        loading: pending,
    } = useQuery<ExploreDeepStatsQuery, ExploreDeepStatsQueryVariables>(
        EXPLORE_DEEP_STATS,
        {
            variables,
        },
    );

    const handleImageExportClick = useCallback(() => {
        console.warn('jpeg export clicked');
    }, []);

    const handlePdfExportClick = useCallback(() => {
        console.warn('pdf export clicked');
    }, []);

    const handleExcelExportClick = useCallback(() => {
        console.warn('excel export clicked');
    }, []);

    // FIXME: Remove this after fixed in server
    const timeseriesData = useMemo(() => (
        data?.deepExploreStats?.projectAggregationDaily?.map((item) => ({
            date: item.date,
            projectCount: Number(item.projectCount ?? 0),
        }))
    ), [data?.deepExploreStats?.projectAggregationDaily]);

    return (
        <Container
            className={_cs(styles.exploreDeep, className)}
            contentClassName={styles.content}
            headerClassName={styles.header}
            heading="Explore DEEP"
            inlineHeadingDescription
            headingDescription={(
                <DateDualRangeInput
                    variant="general"
                    fromName="fromDate"
                    fromOnChange={setStartDate}
                    fromValue={startDate}
                    toName="toDate"
                    toOnChange={setEndDate}
                    toValue={endDate}
                    label=""
                />
            )}
            headerActions={(
                <DropdownMenu
                    label="Download"
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
                        disabled
                    >
                        PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        name={undefined}
                        onClick={handleExcelExportClick}
                        disabled
                    >
                        Excel
                    </DropdownMenuItem>
                </DropdownMenu>
            )}
            headerDescriptionClassName={styles.headerDescription}
            headerDescription={(
                <>
                    <div className={styles.statsContainer}>
                        <Card className={_cs(styles.statCard, styles.projectStatsCard)}>
                            <StatsInformationCard
                                className={styles.infoCard}
                                icon={(
                                    <IoDocument />
                                )}
                                label="Projects"
                                totalValue={data?.deepExploreStats?.totalProjects}
                                variant="accent"
                            />
                            <StatsInformationCard
                                className={styles.infoCard}
                                icon={(
                                    <IoPerson />
                                )}
                                label="Users"
                                totalValue={data?.deepExploreStats?.totalRegisteredUsers}
                                variant="accent"
                            />
                            <StatsInformationCard
                                className={styles.infoCard}
                                icon={(
                                    <IoWalk />
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
                                    <IoDocument />
                                )}
                                label="Sources"
                                totalValue={data?.deepExploreStats?.totalLeads}
                                variant="accent"
                            />
                            <StatsInformationCard
                                className={styles.infoCard}
                                icon={(
                                    <IoGlobe />
                                )}
                                label="Authors"
                                totalValue={data?.deepExploreStats?.totalAuthors}
                                variant="accent"
                            />
                            <StatsInformationCard
                                className={styles.infoCard}
                                icon={(
                                    <IoGlobe />
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
                                    <IoLayers />
                                )}
                                label="Entries"
                                totalValue={data?.deepExploreStats?.totalEntries}
                                variant="accent"
                            />
                            <StatsInformationCard
                                className={styles.infoCard}
                                icon={(
                                    <IoTimeSharp />
                                )}
                                label="Added last week"
                                // TODO: Get entries last week
                                totalValue={data?.deepExploreStats?.totalEntries}
                                variant="accent"
                            />
                        </Card>
                    </div>
                    <ProjectFilters
                        className={styles.filters}
                        initialValue={filters}
                        onFiltersChange={setFilters}
                    />
                </>
            )}
            headingSize="large"
        >
            {pending && <PendingMessage />}
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
                            timeseries={timeseriesData}
                        />
                    </TabPanel>
                    <TabPanel name="entries">
                        <EntriesContent />
                    </TabPanel>
                </div>
                <Container
                    className={styles.bottomContainer}
                    headerActions={(
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
                        data={data?.deepExploreStats?.topTenAuthors}
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
                        data={data?.deepExploreStats?.topTenProjectUsers}
                        mode={representationType}
                        label="Top Ten Projects (Users)"
                    />
                    <TopTenProjectsByEntries
                        className={styles.topTenCard}
                        data={data?.deepExploreStats?.topTenProjectEntries}
                        mode={representationType}
                        label="Top Ten Frameworks"
                    />
                </Container>
            </Tabs>
        </Container>
    );
}

export default NewExploreDeep;
