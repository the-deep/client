import React, { useState } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    IoMapOutline,
    IoList,
} from 'react-icons/io5';
import {
    Tabs,
    Tab,
    TabList,
    TabPanel,
    Container,
} from '@the-deep/deep-ui';

import { ProjectListQueryVariables } from '#generated/types';

import ProjectFilterForm from './ProjectFilterForm';
import TableView from './TableView';
import MapView from './MapView';

import styles from './styles.css';

interface Props {
    className?: string;
}

function ExploreDeep(props: Props) {
    const {
        className,
    } = props;

    const [filters, setFilters] = useState<ProjectListQueryVariables | undefined>(undefined);

    return (
        <Tabs
            useHash
            defaultHash="table"
        >
            <Container
                className={_cs(styles.exploreDeep, className)}
                heading="Explore DEEP"
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
                    <MapView />
                </TabPanel>
            </Container>
        </Tabs>
    );
}

export default ExploreDeep;
