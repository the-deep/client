import React, { useCallback, useMemo, useState } from 'react';
import {
    _cs,
    isDefined,
    formatDateToString,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    Container,
    DateDualRangeInput,
    Heading,
    Tab,
    TabPanel,
    TabList,
    Tabs,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';
import { removeNull } from '@togglecorp/toggle-form';

import {
    todaysDate,
    DEEP_START_DATE,
} from '#utils/common';
import { resolveTime } from '#utils/temporal';
import ProjectContext from '#base/context/ProjectContext';
import {
    ProjectMetadataForAryQuery,
    ProjectMetadataForAryQueryVariables,
    AryDashboardStatisticsQuery,
    AryDashboardStatisticsQueryVariables,
} from '#generated/types';

import Statistics from './Statistics';
import Filters, { FilterForm } from './Filters';
import WhatAssessed from './WhatAssessed';
import MainFindings from './MainFindings';
import HowAssessed from './HowAssessed';
import QualityAssessment from './QualityAssessment';

import styles from './styles.css';

const ARY_DASHBOARD_STATISTICS = gql`
    query AryDashboardStatistics(
        $projectId: ID!,
        $filter: AssessmentDashboardFilterInputType!,
    ) {
        project(id: $projectId) {
            id
            assessmentDashboardStatistics(filter: $filter){
                totalAssessment
                totalCollectionTechnique
                totalMultisectorAssessment
                totalSinglesectorAssessment
                totalStakeholder
                stakeholderCount {
                    count
                    stakeholder
                }
                collectionTechniqueCount {
                    count
                    dataCollectionTechnique
                    dataCollectionTechniqueDisplay
                }
                assessmentCount {
                    coordinatedJoint
                    coordinatedJointDisplay
                    count
                }
            }
        }
    }
`;

const PROJECT_METADATA_FOR_ARY = gql`
    query ProjectMetadataForAry(
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            id
            createdAt
            regions {
                id
                title
                mediaSources
                centroid
                adminLevels {
                    geojsonFile {
                        name
                        url
                    }
                    id
                    level
                    title
                    boundsFile {
                        name
                        url
                    }
                }
            }
        }
    }
`;

const todaysDateTime = resolveTime(todaysDate, 'day').getTime();

interface Props {
    className?: string;
}

function AryDashboard(props: Props) {
    const {
        className,
    } = props;

    const { project } = React.useContext(ProjectContext);
    const activeProject = project?.id;
    const [filters, setFilters] = useState<FilterForm | undefined>(undefined);
    const [selectedRegion, setSelectedRegion] = useState<string>();
    const [activeAdminLevel, setActiveAdminLevel] = useState<string>();

    const [
        startDate = todaysDateTime,
        setStartDate,
    ] = useState<number | undefined>(todaysDateTime);
    const [
        endDate = todaysDateTime,
        setEndDate,
    ] = useState<number | undefined>(todaysDateTime);

    const variables = useMemo(() => (
        activeProject
            ? ({
                projectId: activeProject,
                filter: {
                    dateFrom: formatDateToString(new Date(startDate), 'yyyy-MM-dd'),
                    dateTo: formatDateToString(new Date(endDate), 'yyyy-MM-dd'),
                    assessment: filters,
                },
            }) : undefined
    ), [
        activeProject,
        startDate,
        endDate,
        filters,
    ]);

    const {
        loading: metadataLoading,
        data: projectMetadataResponse,
    } = useQuery<ProjectMetadataForAryQuery, ProjectMetadataForAryQueryVariables>(
        PROJECT_METADATA_FOR_ARY,
        {
            skip: !activeProject,
            variables: activeProject ? { projectId: activeProject } : undefined,
            onCompleted: (response) => {
                const projectStartDate = resolveTime(
                    new Date(response.project?.createdAt ?? todaysDateTime),
                    'day',
                ).getTime();
                setStartDate(projectStartDate);
                setSelectedRegion(response.project?.regions?.[0].id);

                if (isDefined(activeAdminLevel)) {
                    return;
                }
                const adminLevels = response.project?.regions?.[0].adminLevels;
                // NOTE: Selected 2nd admin level by default
                if ((adminLevels?.length ?? 0) > 1) {
                    setActiveAdminLevel(adminLevels?.[1]?.id);
                    return;
                }
                // NOTE: Setting 2nd admin level as fallback
                if ((adminLevels?.length ?? 0) >= 1) {
                    setActiveAdminLevel(adminLevels?.[0]?.id);
                }
            },
        },
    );

    const {
        previousData,
        loading,
        data = previousData,
    } = useQuery<AryDashboardStatisticsQuery, AryDashboardStatisticsQueryVariables>(
        ARY_DASHBOARD_STATISTICS,
        {
            skip: isNotDefined(variables),
            variables,
        },
    );

    const projectMetadata = useMemo(
        () => removeNull(projectMetadataResponse?.project),
        [projectMetadataResponse?.project],
    );
    const handleRegionChange = useCallback((newRegion: string | undefined) => {
        setSelectedRegion(newRegion);
        const adminLevels = projectMetadata?.regions
            ?.find((item) => item.id === newRegion)?.adminLevels;

        // NOTE: Selected 2nd admin level by default
        if ((adminLevels?.length ?? 0) > 1) {
            setActiveAdminLevel(adminLevels?.[1]?.id);
            return;
        }
        // NOTE: Setting 2nd admin level as fallback
        if ((adminLevels?.length ?? 0) >= 1) {
            setActiveAdminLevel(adminLevels?.[0]?.id);
            return;
        }
        setActiveAdminLevel(undefined);
    }, [projectMetadata]);

    const projectData = removeNull(data?.project);
    const projectStartDate = useMemo(() => (
        resolveTime(new Date(projectMetadata?.createdAt ?? DEEP_START_DATE), 'day').getTime()
    ), [projectMetadata?.createdAt]);

    const handleEndDateChange = useCallback((newDate: number | undefined) => {
        if (isDefined(newDate)) {
            setEndDate(Math.min(newDate, todaysDateTime));
        } else {
            setEndDate(undefined);
        }
    }, []);

    const handleStartDateChange = useCallback((newDate: number | undefined) => {
        if (isDefined(newDate)) {
            setStartDate(Math.max(newDate, projectStartDate));
        } else {
            setStartDate(undefined);
        }
    }, [projectStartDate]);

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

    const startDateString = formatDateToString(new Date(startDate), 'yyyy-MM-dd');
    const endDateString = formatDateToString(new Date(endDate), 'yyyy-MM-dd');

    return (
        <Container
            className={_cs(styles.dashboard, className)}
            contentClassName={styles.content}
            heading="Assessments Dashboard"
            spacing="loose"
            inlineHeadingDescription
            headerClassName={styles.header}
            headingDescriptionClassName={styles.headingDescription}
            headingDescription={(
                <>
                    <Heading
                        className={styles.dateRangeOutput}
                        size="small"
                    >
                        {`(${startDateString} - ${endDateString})`}
                    </Heading>
                    {/* <AiOutlineLoading className={styles.loading} /> */}
                </>
            )}
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
            headerDescriptionClassName={styles.headerDescription}
            headerDescription={(
                <>
                    {activeProject && (
                        <Filters
                            projectId={activeProject}
                            onFiltersChange={setFilters}
                            initialValue={filters}
                        />
                    )}
                    <Statistics
                        data={projectData?.assessmentDashboardStatistics}
                    />
                </>
            )}
        >
            <div className={styles.container}>
                <Tabs
                    defaultHash="what"
                    useHash
                >
                    <TabList className={styles.contentHeader}>
                        <Tab
                            name="what"
                            transparentBorder
                        >
                            What was assessed?
                        </Tab>
                        <Tab
                            name="how"
                            transparentBorder
                        >
                            How was it assessed?
                        </Tab>
                        <Tab
                            name="quality"
                            transparentBorder
                        >
                            What is the quality of assessments?
                        </Tab>
                        <Tab
                            name="information"
                            transparentBorder
                        >
                            What do we know and do not know?
                        </Tab>
                        <Tab
                            name="findings"
                            transparentBorder
                        >
                            What are the main findings?
                        </Tab>
                    </TabList>
                    <TabPanel
                        name="what"
                    >
                        {activeProject && (
                            <WhatAssessed
                                regions={projectMetadata?.regions}
                                filters={filters}
                                projectId={activeProject}
                                projectStartDate={projectStartDate}
                                startDate={startDate}
                                endDate={endDate}
                                onStartDateChange={setStartDate}
                                onEndDateChange={setEndDate}
                                selectedRegion={selectedRegion}
                                selectedAdminLevel={activeAdminLevel}
                                onAdminLevelChange={setActiveAdminLevel}
                                onRegionChange={handleRegionChange}
                                readOnly={loading || metadataLoading}
                            />
                        )}
                    </TabPanel>
                    <TabPanel
                        name="how"
                    >
                        {activeProject && (
                            <HowAssessed
                                regions={projectMetadata?.regions}
                                filters={filters}
                                selectedRegion={selectedRegion}
                                onRegionChange={handleRegionChange}
                                selectedAdminLevel={activeAdminLevel}
                                onAdminLevelChange={setActiveAdminLevel}
                                startDate={startDate}
                                projectId={activeProject}
                                endDate={endDate}
                            />
                        )}
                    </TabPanel>
                    <TabPanel
                        name="quality"
                    >
                        <QualityAssessment
                            regions={projectData?.regions}
                            filters={variables}
                            selectedRegion={selectedRegion}
                            onRegionChange={handleRegionChange}
                            selectedAdminLevel={activeAdminLevel}
                            onAdminLevelChange={setActiveAdminLevel}
                        />
                    </TabPanel>
                    <TabPanel
                        name="information"
                    >
                        What do we know and do not know?
                    </TabPanel>
                    <TabPanel
                        name="findings"
                    >
                        <MainFindings />
                    </TabPanel>
                </Tabs>
            </div>
        </Container>
    );
}

export default AryDashboard;
