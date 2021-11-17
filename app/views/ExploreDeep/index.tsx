import React, { useMemo, useCallback, useState } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    removeNull,
} from '@togglecorp/toggle-form';
import {
    IoMapOutline,
    IoBookmarks,
    IoDocuments,
    IoPricetag,
    IoList,
    IoDocumentText,
    IoPersonSharp,
} from 'react-icons/io5';
import {
    Tabs,
    PendingMessage,
    ListView,
    Tab,
    TabList,
    TabPanel,
    Card,
    Message,
    Container,
    InformationCard,
    CompactInformationCard,
    ContainerCard,
} from '@the-deep/deep-ui';

import {
    ProjectListQueryVariables,
    ProjectExploreStatsQuery,
} from '#generated/types';

import ProjectFilterForm from './ProjectFilterForm';
import ActiveProjectItem, { Props as ActiveProjectItemProps } from './ActiveProject';
import ActiveFrameworkItem, { Props as ActiveFrameworkItemProps } from './ActiveFramework';
import TableView from './TableView';
import MapView from './MapView';

import styles from './styles.css';

const PROJECT_EXPLORE_STATS = gql`
    query ProjectExploreStats {
        projectExploreStats {
            calculatedAt
            dailyAverageLeadsTaggedPerProject
            generatedExportsMonthly
            leadsAddedWeekly
            totalUsers
            totalProjects
            topActiveProjects {
                analysisFrameworkId
                analysisFrameworkTitle
                projectId
                projectTitle
            }
            topActiveFrameworks {
                analysisFrameworkId
                analysisFrameworkTitle
                projectCount
                sourceCount
            }
        }
    }
`;

type ActiveProject = NonNullable<NonNullable<ProjectExploreStatsQuery['projectExploreStats']>['topActiveProjects']>[number];
type ActiveFramework = NonNullable<NonNullable<ProjectExploreStatsQuery['projectExploreStats']>['topActiveFrameworks']>[number];

const activeProjectKeySelector = (project: ActiveProject) => project.projectId;
const activeFrameworkKeySelector = (framework: ActiveFramework) => framework.analysisFrameworkId;

interface Props {
    className?: string;
}

function ExploreDeep(props: Props) {
    const {
        className,
    } = props;

    const {
        data,
        loading,
    } = useQuery<ProjectExploreStatsQuery>(
        PROJECT_EXPLORE_STATS,
    );

    const [filters, setFilters] = useState<ProjectListQueryVariables | undefined>(undefined);

    const activeProjectsRendererParams = useCallback(
        (_:string, datum: ActiveProject): ActiveProjectItemProps => ({
            projectTitle: datum.projectTitle ?? undefined,
            frameworkTitle: datum.analysisFrameworkTitle ?? undefined,
        }),
        [],
    );

    const activeFrameworkRendererParams = useCallback(
        (_: string, datum: ActiveFramework): ActiveFrameworkItemProps => ({
            frameworkTitle: datum.analysisFrameworkTitle ?? undefined,
            projectCount: datum.projectCount ?? undefined,
            sourceCount: datum.sourceCount ?? undefined,
        }),
        [],
    );

    const projectList = useMemo(() => (
        removeNull(data?.projectExploreStats?.topActiveProjects)
    ), [data?.projectExploreStats?.topActiveProjects]);

    const frameworkList = useMemo(() => (
        removeNull(data?.projectExploreStats?.topActiveFrameworks)
    ), [data?.projectExploreStats?.topActiveFrameworks]);

    return (
        <Container
            className={_cs(styles.exploreDeep, className)}
            heading="Explore DEEP"
        >
            {loading && <PendingMessage />}
            <div className={styles.statsContainer}>
                <div className={styles.leftContainer}>
                    <InformationCard
                        className={styles.infoItem}
                        icon={<IoDocumentText />}
                        label="Projects"
                        value={data?.projectExploreStats?.totalProjects ?? 0}
                        variant="complement1"
                        coloredBackground
                    />
                    <InformationCard
                        className={styles.infoItem}
                        icon={<IoPersonSharp />}
                        label="Active Users"
                        value={data?.projectExploreStats?.totalUsers ?? 0}
                        variant="accent"
                        coloredBackground
                    />
                    <Card className={styles.playbackCard}>
                        <Message message="DEEP tutorials go here" />
                    </Card>
                </div>
                <div className={styles.midContainer}>
                    <Card className={styles.statsByTimeContainer}>
                        <CompactInformationCard
                            className={styles.infoItem}
                            icon={<IoBookmarks />}
                            label="Sources added weekly"
                            valuePrecision={2}
                            value={data?.projectExploreStats?.leadsAddedWeekly ?? 0}
                        />
                        <CompactInformationCard
                            className={styles.infoItem}
                            icon={<IoPricetag />}
                            label="Daily average sources tagged per project"
                            valuePrecision={2}
                            value={
                                data?.projectExploreStats?.dailyAverageLeadsTaggedPerProject ?? 0
                            }
                        />
                        <CompactInformationCard
                            className={styles.infoItem}
                            icon={<IoDocuments />}
                            label="Generated reports monthly"
                            valuePrecision={2}
                            value={data?.projectExploreStats?.generatedExportsMonthly ?? 0}
                        />
                    </Card>
                    <ContainerCard
                        className={styles.frameworkContainer}
                        heading="Top 5 most used frameworks"
                        headingDescription="Last 3 months"
                        headingSize="medium"
                        borderBelowHeader
                        borderBelowHeaderWidth="thin"
                        inlineHeadingDescription
                        contentClassName={styles.frameworkListContainer}
                    >
                        <ListView
                            data={frameworkList ?? undefined}
                            keySelector={activeFrameworkKeySelector}
                            renderer={ActiveFrameworkItem}
                            rendererParams={activeFrameworkRendererParams}
                        />
                    </ContainerCard>
                </div>
                <ContainerCard
                    className={styles.rightContainer}
                    heading="Top 5 most active project"
                    headingDescription="Last 3 months"
                    headingSize="medium"
                    borderBelowHeader
                    borderBelowHeaderWidth="thin"
                    inlineHeadingDescription
                    contentClassName={styles.projectListContainer}
                >
                    <ListView
                        data={projectList ?? undefined}
                        keySelector={activeProjectKeySelector}
                        renderer={ActiveProjectItem}
                        rendererParams={activeProjectsRendererParams}
                    />
                </ContainerCard>
            </div>
            <Tabs
                useHash
                defaultHash="table"
            >
                <Container
                    className={styles.tabsContainer}
                    headerDescription={(
                        <ProjectFilterForm
                            filters={filters}
                            onFiltersChange={setFilters}
                        />
                    )}
                    headerActions={(
                        <TabList>
                            <Tab
                                name="table"
                                transparentBorder
                            >
                                <IoList />
                            </Tab>
                            <Tab
                                name="map"
                                transparentBorder
                            >
                                <IoMapOutline />
                            </Tab>
                        </TabList>
                    )}
                    spacing="compact"
                >
                    <TabPanel name="table">
                        <TableView
                            filters={filters}
                        />
                    </TabPanel>
                    <TabPanel name="map">
                        <MapView
                            filters={filters}
                        />
                    </TabPanel>
                </Container>
            </Tabs>
        </Container>
    );
}

export default ExploreDeep;
