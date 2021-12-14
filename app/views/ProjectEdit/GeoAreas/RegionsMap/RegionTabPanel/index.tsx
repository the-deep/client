import React from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import {
    TabPanel,
} from '@the-deep/deep-ui';

import RegionMap from '#components/region/RegionMap';
import styles from './styles.css';

interface Props {
    id: string;
    activeAdminLevel: string | undefined;
    onActiveAdminLevelChange: (value: string | undefined) => void | undefined;
    className?: string;
    navigationDisabled?: boolean;
    triggerId?: number;
}

function RegionTabPanel(props: Props) {
    const {
        className,
        id,
        activeAdminLevel,
        onActiveAdminLevelChange,
        navigationDisabled,
        triggerId,
    } = props;

    return (
        <TabPanel
            className={_cs(styles.tabPanel, className)}
            name={id}
        >
            <RegionMap
                className={styles.mapContainer}
                regionId={id}
                showTooltip={isDefined(activeAdminLevel)}
                adminLevel={activeAdminLevel}
                onAdminLevelChange={onActiveAdminLevelChange}
                navigationDisabled={navigationDisabled}
                triggerId={triggerId}
                geoAreaOptions={undefined}
                onGeoAreaOptionsChange={undefined}
            />
        </TabPanel>
    );
}

export default RegionTabPanel;
