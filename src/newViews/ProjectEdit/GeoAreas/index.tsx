import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    ListView,
    Container,
} from '@the-deep/deep-ui';
import {
    IoAdd,
} from 'react-icons/io5';

import {
    Region,
    BasicRegion,
} from '#typings';
import { useRequest } from '#utils/request';
import _ts from '#ts';

import RegionMapList from './RegionMapList';
import RegionCard from './RegionCard';
import CustomGeoAddForm from './CustomGeoAddForm';
import styles from './styles.scss';

const regionKeySelector = (d: Region) => d.id;

interface Props {
    className?: string;
    activeProject: number;
}

function GeoAreas(props: Props) {
    const {
        className,
        activeProject,
    } = props;

    const [addCustomVisibility, setAddCustomVisibility] = useState<boolean>(false);

    const {
        response: regionResponse,
        retrigger: regionsGetTrigger,
    } = useRequest<{ regions: Region[] }>({
        url: `server://projects/${activeProject}/regions/`,
        method: 'GET',
        failureHeader: 'Regions List',
    });

    const regions = regionResponse?.regions;

    const regionRendererParams = useCallback((_: number, data: BasicRegion) => ({
        region: data,
    }), []);

    const handleCustomGeoAddClick = useCallback(() => {
        setAddCustomVisibility(true);
    }, []);

    return (
        <div className={_cs(className, styles.geoAreas)}>
            <div className={styles.mapContainer}>
                <RegionMapList
                    className={styles.map}
                    activeProject={activeProject}
                />
            </div>
            <div className={styles.listContainer}>
                <Button
                    className={styles.addCustom}
                    variant="secondary"
                    name="addCustomGeo"
                    icons={<IoAdd />}
                    onClick={handleCustomGeoAddClick}
                >
                    {_ts('geoAreas', 'addCustom')}
                </Button>
                <Container
                    className={styles.geoAreasDropdown}
                    headerClassName={styles.header}
                    contentClassName={styles.content}
                    sub
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
                </Container>
                {addCustomVisibility && (
                    <CustomGeoAddForm
                        projectId={activeProject}
                        onSuccess={regionsGetTrigger}
                    />
                )}
            </div>
        </div>
    );
}

export default GeoAreas;
