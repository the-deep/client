import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { PartialForm } from '@togglecorp/toggle-form';
import {
    Button,
    List,
    Container,
} from '@the-deep/deep-ui';
import {
    IoAdd,
} from 'react-icons/io5';

import {
    Region,
    BasicRegion,
    AdminLevelGeoArea,
} from '#types';
import { useRequest } from '#base/utils/restRequest';
import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import RegionsMap from './RegionsMap';
import RegionCard from './RegionCard';
import CustomGeoAddModal from './CustomGeoAddModal';

import styles from './styles.css';

const regionKeySelector = (d: Region) => d.id;

type AdminLevel = AdminLevelGeoArea & { clientId: string };
type PartialAdminLevel = PartialForm<AdminLevel, 'clientId' | 'geoShapeFileDetails'>;

interface Props {
    className?: string;
    activeProject: string;
}

function GeoAreas(props: Props) {
    const {
        className,
        activeProject,
    } = props;

    const [
        tempAdminLevel,
        setTempAdminLevel,
    ] = useState<PartialAdminLevel | undefined>(undefined);

    const navigationDisabled = !!tempAdminLevel;

    const [
        geoAddModalVisible,
        showGeoAddModal,
        hideGeoAddModal,
    ] = useModalState(false);

    const [mapTriggerId, setMapTriggerId] = useState<number | undefined>();

    const [
        activeAdminLevel,
        setActiveAdminLevel,
    ] = useState<string | undefined>();

    const [
        activeRegion,
        setActiveRegion,
    ] = useState<string | undefined>();

    const {
        response: regionResponse,
        retrigger: regionsGetTrigger,
        pending: regionsPending,
    } = useRequest<{ regions: Region[] }>({
        url: `server://projects/${activeProject}/regions/`,
        method: 'GET',
        failureHeader: 'Regions List',
        preserveResponse: true,
    });

    const handleRegionSet = useCallback(
        (value: string | undefined) => {
            setActiveRegion(value);
            setActiveAdminLevel(undefined);
        },
        [],
    );

    const handleExpansion = useCallback(
        (expanded: boolean, name: string) => {
            handleRegionSet(expanded ? name : undefined);
        },
        [handleRegionSet],
    );

    const handleGeoAreaAddSuccess = useCallback(
        (value: Region) => {
            handleRegionSet(value.id.toString());
            regionsGetTrigger();
        },
        [handleRegionSet, regionsGetTrigger],
    );

    const updateMapTriggerId = useCallback(
        () => {
            setMapTriggerId(new Date().getTime());
        },
        [],
    );

    const regionRendererParams = useCallback(
        (_: number, data: BasicRegion) => {
            const isExpanded = data.id.toString() === activeRegion;
            return {
                region: data,
                activeProject,
                isExpanded,
                handleExpansion,
                onActiveAdminLevelChange: isExpanded ? setActiveAdminLevel : undefined,
                activeAdminLevel: isExpanded ? activeAdminLevel : undefined,
                tempAdminLevel: isExpanded ? tempAdminLevel : undefined,
                onTempAdminLevelChange: isExpanded ? setTempAdminLevel : undefined,
                onAdminLevelUpdate: isExpanded ? updateMapTriggerId : undefined,
                navigationDisabled,
            };
        },
        [
            activeProject, activeRegion, activeAdminLevel,
            handleExpansion, tempAdminLevel, navigationDisabled,
            updateMapTriggerId,
        ],
    );

    return (
        <div className={_cs(className, styles.geoAreas)}>
            <div className={styles.mapContainer}>
                <RegionsMap
                    className={styles.map}
                    projectId={activeProject}
                    regions={regionResponse?.regions}
                    onRegionAdd={regionsGetTrigger}
                    activeAdminLevel={tempAdminLevel ? undefined : activeAdminLevel}
                    activeRegion={activeRegion}
                    onActiveAdminLevelChange={setActiveAdminLevel}
                    onActiveRegionChange={handleRegionSet}
                    navigationDisabled={navigationDisabled}
                    triggerId={mapTriggerId}
                    regionsPending={regionsPending}
                />
            </div>
            <Container
                className={styles.geoAreasList}
                contentClassName={styles.content}
                heading={_ts('geoAreas', 'title')}
                headerActions={(
                    <Button
                        className={styles.addCustom}
                        variant="secondary"
                        name="addCustomGeo"
                        icons={<IoAdd />}
                        onClick={showGeoAddModal}
                        disabled={navigationDisabled}
                    >
                        {_ts('geoAreas', 'addCustom')}
                    </Button>
                )}
                headingSize="small"
            >
                <List
                    data={regionResponse?.regions}
                    rendererParams={regionRendererParams}
                    renderer={RegionCard}
                    rendererClassName={styles.region}
                    keySelector={regionKeySelector}
                />
            </Container>
            {geoAddModalVisible && (
                <CustomGeoAddModal
                    projectId={activeProject}
                    onSuccess={handleGeoAreaAddSuccess}
                    onModalClose={hideGeoAddModal}
                />
            )}
        </div>
    );
}

export default GeoAreas;
