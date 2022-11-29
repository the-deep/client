import React, { useState, useCallback } from 'react';
import {
    _cs,
    formatDateToString,
} from '@togglecorp/fujs';
import {
    Card,
    Container,
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

import StatsInformationCard from '#components/StatsInformationCard';

import ProjectFilters, { FormType } from './ProjectFilters';
import ProjectContent from './ProjectContent';
import EntriesContent from './EntriesContent';
import TopTenAuthors, { TopAuthor } from './TopTenAuthors';

import styles from './styles.css';

const topTenAuthorDummy: TopAuthor[] = [
    {
        id: '11',
        title: '1st organization',
        mergedAs: {
            id: '12',
            title: '1st Parent',
        },
        projectCount: 12,
        sourceCount: 11423,
    },
    {
        id: '14',
        title: '2st organization',
        mergedAs: {
            id: '13',
            title: '2st Parent',
        },
        projectCount: 12,
        sourceCount: 1123,
    },
    {
        id: '3',
        title: '3rd organization',
        projectCount: 12,
        sourceCount: 1023,
    },
];

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

interface Props {
    className?: string;
}

function NewExploreDeep(props: Props) {
    const {
        className,
    } = props;

    const [startDate, setStartDate] = useState<string | undefined>('2018-01-01');
    const [endDate, setEndDate] = useState<string | undefined>(formatDateToString(new Date(), 'yyyy-MM-dd'));
    const [filters, setFilters] = useState<FormType | undefined>(undefined);
    const [representationType, setRepresentationType] = useState<Option['key']>('table');

    const handleJpegExportClick = useCallback(() => {
        console.warn('jpeg export clicked');
    }, []);

    const handlePdfExportClick = useCallback(() => {
        console.warn('pdf export clicked');
    }, []);

    const handleExcelExportClick = useCallback(() => {
        console.warn('excel export clicked');
    }, []);

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
                        onClick={handleJpegExportClick}
                        disabled
                    >
                        Jpeg
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
                                totalValue={201}
                                variant="accent"
                            />
                            <StatsInformationCard
                                className={styles.infoCard}
                                icon={(
                                    <IoPerson />
                                )}
                                label="Users"
                                totalValue={15}
                                variant="accent"
                            />
                            <StatsInformationCard
                                className={styles.infoCard}
                                icon={(
                                    <IoWalk />
                                )}
                                label="Active Users"
                                totalValue={5}
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
                                totalValue={201}
                                variant="accent"
                            />
                            <StatsInformationCard
                                className={styles.infoCard}
                                icon={(
                                    <IoGlobe />
                                )}
                                label="Authors"
                                totalValue={201}
                                variant="accent"
                            />
                            <StatsInformationCard
                                className={styles.infoCard}
                                icon={(
                                    <IoGlobe />
                                )}
                                label="Publishers"
                                totalValue={201}
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
                                totalValue={201}
                                variant="accent"
                            />
                            <StatsInformationCard
                                className={styles.infoCard}
                                icon={(
                                    <IoTimeSharp />
                                )}
                                label="Added last week"
                                totalValue={21}
                                variant="accent"
                            />
                        </Card>
                    </div>
                    <ProjectFilters
                        className={styles.filters}
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                </>
            )}
            headingSize="large"
        >
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
                        <ProjectContent />
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
                        data={topTenAuthorDummy}
                        mode={representationType}
                        label="Top Ten Authors"
                    />
                    <TopTenAuthors
                        className={styles.topTenCard}
                        data={topTenAuthorDummy}
                        mode={representationType}
                        label="Top Ten Publishers"
                    />
                </Container>
            </Tabs>
        </Container>
    );
}

export default NewExploreDeep;
