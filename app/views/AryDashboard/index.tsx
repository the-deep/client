import React, { useCallback, useState } from 'react';
import {
    _cs,
    isDefined,
    formatDateToString,
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

import {
    todaysDate,
    DEEP_START_DATE,
    lastYearStartDate,
} from '#utils/common';
import { resolveTime } from '#utils/temporal';
import ProjectContext from '#base/context/ProjectContext';

import Statistics from './Statistics';
import Filters, { FilterForm } from './Filters';
import styles from './styles.css';

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

    const [
        startDate = lastYearDateTime,
        setStartDate,
    ] = useState<number | undefined>(lastYearDateTime);
    const [
        endDate = todaysDateTime,
        setEndDate,
    ] = useState<number | undefined>(todaysDateTime);

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

    const startDateString = formatDateToString(new Date(startDate), 'yyyy-MM-dd');
    const endDateString = formatDateToString(new Date(endDate), 'yyyy-MM-dd');
    const [filters, setFilters] = useState<FilterForm | undefined>(undefined);

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
            headerDescription={activeProject && (
                <Statistics
                    projectId={activeProject}
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
                        What do we know and donot know?
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
                    What was assessed?
                </TabPanel>
                <TabPanel
                    name="how"
                >
                    How was it assessed?
                </TabPanel>
                <TabPanel
                    name="quality"
                >
                    What is the quality of assessments?
                </TabPanel>
                <TabPanel
                    name="information"
                >
                    What do we know and donot know?
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
