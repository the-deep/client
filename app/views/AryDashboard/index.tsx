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
    lastYearStartDate,
} from '#utils/common';
import { resolveTime } from '#utils/temporal';
import ProjectContext from '#base/context/ProjectContext';
import {
    AryDashboardFilterQuery,
    AryDashboardFilterQueryVariables,
    AssessmentDashboardFilterDataInputType,
} from '#generated/types';

import Statistics from './Statistics';
import Filters, { FilterForm } from './Filters';
import WhatAssessed from './WhatAssessed';
import HowAssessed from './HowAssessed';

import styles from './styles.css';

const ARY_DASHBOARD_FILTER = gql`
    query AryDashboardFilter(
        $projectId: ID!,
        $filter: AssessmentDashboardFilterInputType!,
    ) {
        project(id: $projectId) {
            id
            createdAt
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

const lastYearDateTime = resolveTime(lastYearStartDate, 'day').getTime();
const todaysDateTime = resolveTime(todaysDate, 'day').getTime();
const deepStartDateTime = resolveTime(DEEP_START_DATE, 'day').getTime();

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
    const [
        startDate = lastYearDateTime,
        setStartDate,
    ] = useState<number | undefined>(lastYearDateTime);
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
                    assessment: filters as AssessmentDashboardFilterDataInputType,
                },
            }) : undefined
    ), [
        activeProject,
        startDate,
        endDate,
        filters,
    ]);

    const {
        loading,
        data,
    } = useQuery<AryDashboardFilterQuery, AryDashboardFilterQueryVariables>(
        ARY_DASHBOARD_FILTER,
        {
            skip: isNotDefined(variables),
            variables,
            onCompleted: (response) => {
                setSelectedRegion(response.project?.regions?.[0].id);
            },
        },
    );

    const handleEndDateChange = useCallback((newDate: number | undefined) => {
        if (isDefined(newDate)) {
            setEndDate(newDate);
            // setEndDate(Math.min(newDate, todaysDateTime));
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

    const startDateString = formatDateToString(new Date(startDate), 'yyyy-MM-dd');
    const endDateString = formatDateToString(new Date(endDate), 'yyyy-MM-dd');
    const projectData = removeNull(data?.project);
    const projectStartDate = resolveTime(new Date(data?.project?.createdAt ?? DEEP_START_DATE), 'day').getTime();

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
            headerDescription={(
                <Statistics
                    data={projectData?.assessmentDashboardStatistics}
                />
            )}
        >
            {activeProject && (
                <Filters
                    projectId={activeProject}
                    onFiltersChange={setFilters}
                    initialValue={filters}
                />
            )}
            <Tabs
                defaultHash="what"
                useHash
            >
                <TabList>
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
                    <WhatAssessed
                        regions={projectData?.regions}
                        filters={variables}
                        startDate={projectStartDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion}
                        readOnly={loading}
                    />
                </TabPanel>
                <TabPanel
                    name="how"
                >
                    <HowAssessed
                        regions={projectData?.regions}
                        filters={variables}
                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion}
                    />
                </TabPanel>
                <TabPanel
                    name="quality"
                >
                    What is the quality of assessments?
                </TabPanel>
                <TabPanel
                    name="information"
                >
                    What do we know and do not know?
                </TabPanel>
                <TabPanel
                    name="findings"
                >
                    What are the main findings?
                </TabPanel>
            </Tabs>
        </Container>
    );
}

export default AryDashboard;
