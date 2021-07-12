import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TabPanel,
} from '@the-deep/deep-ui';

import RegionMap from './RegionMap';

import styles from './styles.scss';

interface Props {
    id: string;
    className?: string;
}

function RegionTabPanel(props: Props) {
    const {
        id,
        className,
    } = props;

    return (
        <TabPanel
            className={_cs(styles.tabPanel, className)}
            name={id}
        >
            <RegionMap
                className={styles.mapContainer}
                regionId={id}
            />
        </TabPanel>
    );
}

export default RegionTabPanel;
