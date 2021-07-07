import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    ListView,
    ExpandableContainer,
} from '@the-deep/deep-ui';
import {
    IoAdd,
} from 'react-icons/io5';

import {
    BasicRegion,
} from '#typings';
import _ts from '#ts';

import RegionCard from './RegionCard';
import styles from './styles.scss';

const regionKeySelector = (d: BasicRegion) => d.id;

interface Props {
    className?: string;
    regions: BasicRegion[];
}

function GeoAreas(props: Props) {
    const {
        className,
        regions,
    } = props;

    const regionRendererParams = useCallback((_: number, data: BasicRegion) => ({
        region: data,
    }), []);

    return (
        <div className={_cs(className, styles.geoAreas)}>
            <div className={styles.mapContainer}>
                map
            </div>
            <div className={styles.listContainer}>
                <Button
                    className={styles.addCustom}
                    variant="secondary"
                    name="addCustomGeo"
                    icons={<IoAdd />}
                >
                    {_ts('geoAreas', 'addCustom')}
                </Button>
                <ExpandableContainer
                    className={styles.geoAreasDropdown}
                    headerClassName={styles.header}
                    contentClassName={styles.content}
                    sub
                    defaultVisibility
                    heading={_ts('geoAreas', 'title')}
                >
                    <ListView
                        className={styles.regions}
                        data={regions}
                        rendererParams={regionRendererParams}
                        renderer={RegionCard}
                        rendererClassName={styles.region}
                        keySelector={regionKeySelector}
                    />
                </ExpandableContainer>
            </div>
        </div>
    );
}

export default GeoAreas;
