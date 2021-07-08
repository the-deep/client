import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoMapOutline } from 'react-icons/io5';
import {
    Tabs,
    Tab,
    TabList,
    Header,
    List,
} from '@the-deep/deep-ui';

import {
    BasicRegion,
} from '#typings';
import _ts from '#ts';

import RegionTabPanel from './RegionTabPanel';

import styles from './styles.scss';

const regionKeySelector = (d: BasicRegion) => d.id.toString();

interface Props {
    regions: BasicRegion[];
    className?: string;
}

function RegionMapList(props: Props) {
    const {
        regions,
        className,
    } = props;

    const [activeTab, setActiveTab] = useState<string>(regions[0]?.id.toString());

    const tabRendererParams = useCallback((id: string, data: BasicRegion) => ({
        name: id,
        children: data.title,
    }), []);

    const regionTabPanelRendererParams = useCallback((id: string) => ({
        id,
    }), []);

    if (regions.length < 1) {
        return (
            <div className={_cs(styles.message, className)}>
                <IoMapOutline className={styles.icon} />
                {_ts('geoAreas', 'noGeoAreas')}
            </div>
        );
    }

    return (
        <div className={_cs(styles.regionMapList, className)}>
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
            >
                <Header
                    className={styles.header}
                    heading={_ts('geoAreas', 'projectMaps')}
                    headingSize="medium"
                    childrenContainerClassName={styles.tabs}
                >
                    <TabList>
                        <List
                            data={regions}
                            rendererParams={tabRendererParams}
                            renderer={Tab}
                            keySelector={regionKeySelector}
                        />
                    </TabList>
                </Header>
                <div className={styles.tabPanelContainer}>
                    <List
                        data={regions}
                        rendererParams={regionTabPanelRendererParams}
                        renderer={RegionTabPanel}
                        rendererClassName={styles.tabPanel}
                        keySelector={regionKeySelector}
                    />
                </div>
            </Tabs>
        </div>
    );
}

export default RegionMapList;
