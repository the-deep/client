import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Tabs,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';
import {
    IoMapOutline,
    IoList,
} from 'react-icons/io5';

import TableView from './TableView';
import MapView from './MapView';

import styles from './styles.css';

interface Props {
    className?: string;
}

function ProjectContent(props: Props) {
    const {
        className,
    } = props;

    const [activeView, setActiveView] = useState<'map' | 'table' | undefined>('map');

    return (
        <div className={_cs(className, styles.projectContent)}>
            <Tabs
                value={activeView}
                onChange={setActiveView}
            >
                <TabList className={styles.tabs}>
                    <Tab
                        name="table"
                        className={styles.tab}
                        transparentBorder
                    >
                        <IoList />
                    </Tab>
                    <Tab
                        name="map"
                        className={styles.tab}
                        transparentBorder
                    >
                        <IoMapOutline />
                    </Tab>
                </TabList>
                <TabPanel
                    name="table"
                >
                    <TableView
                        filters={undefined}
                    />
                </TabPanel>
                <TabPanel
                    name="map"
                >
                    <MapView
                        filters={undefined}
                    />
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default ProjectContent;
