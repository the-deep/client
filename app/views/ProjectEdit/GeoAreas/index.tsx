import React, { useCallback, useState } from 'react';
import {
    IoAdd,
} from 'react-icons/io5';
import { _cs } from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    Button,
    List,
    Container,
} from '@the-deep/deep-ui';

import { PartialForm } from '@togglecorp/toggle-form';
import { useModalState } from '#hooks/stateManagement';
import {
    AdminLevelType,
    CreateRegionMutation,
    RegionsForGeoAreasQuery,
    RegionsForGeoAreasQueryVariables,
} from '#generated/types';
import _ts from '#ts';

import RegionsMap from './RegionsMap';
import RegionCard from './RegionCard';
import CustomGeoAddModal from './CustomGeoAddModal';

import styles from './styles.css';

type AdminLevelWithClientIdType = AdminLevelType & { clientId: string }
type PartialAdminLevel = PartialForm<AdminLevelWithClientIdType>;

const REGIONS_FOR_GEO_AREAS = gql`
    query RegionsForGeoAreas ($id: ID!) {
        project (id: $id) {
            regions {
                id
                isPublished
                adminLevels {
                    id
                    title
                    level
                    nameProp
                    codeProp
                    parentNameProp
                    parentCodeProp
                    parent
                }
                title
                public
            }
        }
    }
`;

type Region = NonNullable<NonNullable<NonNullable<RegionsForGeoAreasQuery['project']>['regions']>[number]>;
type NewRegion = NonNullable<NonNullable<CreateRegionMutation['createRegion']>['result']>;

const regionKeySelectorForRegionCard = (d: Region) => +d.id;

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
        data: regions,
        loading: regionsLoading,
        refetch: regionsRefetch,
    } = useQuery<RegionsForGeoAreasQuery, RegionsForGeoAreasQueryVariables>(
        REGIONS_FOR_GEO_AREAS,
        {
            variables: {
                id: activeProject,
            },
        },
    );

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
        (value: NewRegion) => {
            handleRegionSet(value.id);
            regionsRefetch();
        },
        [handleRegionSet, regionsRefetch],
    );

    const updateMapTriggerId = useCallback(
        () => {
            setMapTriggerId(new Date().getTime());
        },
        [],
    );

    const regionRendererParams = useCallback(
        (_: number, data: Region) => {
            const isExpanded = data.id === activeRegion;
            return {
                region: data,
                activeProject,
                isExpanded,
                isPublished: data.isPublished,
                handleExpansion,
                onActiveAdminLevelChange: isExpanded ? setActiveAdminLevel : undefined,
                activeAdminLevel: isExpanded ? activeAdminLevel : undefined,
                tempAdminLevel: isExpanded ? tempAdminLevel : undefined,
                onTempAdminLevelChange: isExpanded ? setTempAdminLevel : undefined,
                onAdminLevelUpdate: isExpanded ? updateMapTriggerId : undefined,
                onRegionPublishSuccess: regionsRefetch,
                onRegionRemoveSuccess: regionsRefetch,
                navigationDisabled,
            };
        },
        [
            activeProject, activeRegion, activeAdminLevel,
            handleExpansion, tempAdminLevel, navigationDisabled,
            updateMapTriggerId, regionsRefetch,
        ],
    );

    return (
        <div className={_cs(className, styles.geoAreas)}>
            <div className={styles.mapContainer}>
                <RegionsMap
                    className={styles.map}
                    projectId={activeProject}
                    regions={regions?.project?.regions ?? []}
                    onRegionAdd={regionsRefetch}
                    activeAdminLevel={tempAdminLevel ? undefined : activeAdminLevel}
                    activeRegion={activeRegion}
                    onActiveAdminLevelChange={setActiveAdminLevel}
                    onActiveRegionChange={handleRegionSet}
                    navigationDisabled={navigationDisabled}
                    triggerId={mapTriggerId}
                    regionsPending={regionsLoading}
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
                    data={regions?.project?.regions}
                    rendererParams={regionRendererParams}
                    renderer={RegionCard}
                    rendererClassName={styles.region}
                    keySelector={regionKeySelectorForRegionCard}
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
