import React, { useCallback } from 'react';
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
} from '#types';
import { useRequest } from '#utils/request';
import { useModalState } from '#hooks/stateManagement';
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

    const [
        modalVisible,
        showModal,
        hideModal,
    ] = useModalState(false);

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

    return (
        <div className={_cs(className, styles.geoAreas)}>
            <div className={styles.mapContainer}>
                <RegionMapList
                    className={styles.map}
                    projectId={activeProject}
                    regions={regions}
                    onRegionAdd={regionsGetTrigger}
                />
            </div>
            <div className={styles.listContainer}>
                <Button
                    className={styles.addCustom}
                    variant="secondary"
                    name="addCustomGeo"
                    icons={<IoAdd />}
                    onClick={showModal}
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
                {modalVisible && (
                    <CustomGeoAddForm
                        projectId={activeProject}
                        onSuccess={regionsGetTrigger}
                        onModalClose={hideModal}
                    />
                )}
            </div>
        </div>
    );
}

export default GeoAreas;
