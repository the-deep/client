import React, { useState, useMemo, useCallback } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import { useLazyQuery, useQuery, gql } from '@apollo/client';
import {
    Container,
    SelectInput,
    ListView,
    ContainerCard,
} from '@the-deep/deep-ui';
import GeoMultiSelectInput, { GeoArea } from '#components/GeoMultiSelectInput';
import {
    ProjectGeoAreasQuery,
    ProjectGeoAreasQueryVariables,
    ProjectRegionsQuery,
    ProjectRegionsQueryVariables,
} from '#generated/types';

import GeoAreaListItem from './GeoAreaListItem';
import GeoLocationMap from './GeoLocationMap';

import styles from './styles.css';

function geoAreaGroupKeySelector(geoArea: GeoArea) {
    return geoArea.adminLevelTitle;
}

function geoAreaKeySelector(geoArea: GeoArea) {
    return geoArea.id;
}

const GEOAREAS = gql`
    query ProjectGeoAreas(
        $projectId: ID!,
        $ids: [ID!],
    ) {
        project(id: $projectId) {
            geoAreas(ids: $ids) {
                results {
                    adminLevelTitle
                    id
                    regionTitle
                    title
                }
            }
        }
    }
`;

const PROJECT_REGIONS = gql`
    query ProjectRegions($projectId: ID!) {
        project(id: $projectId) {
            regions {
                title
                id
                adminLevels {
                    id
                    level
                    title
                    geojsonFile {
                        name
                        url
                    }
                    boundsFile {
                        name
                        url
                    }
                }
            }
        }
    }
`;

type ProjectRegion = NonNullable<NonNullable<NonNullable<ProjectRegionsQuery>['project']>['regions']>[number];
export type AdminLevel = NonNullable<ProjectRegion['adminLevels']>[number];

function regionKeySelector(d: ProjectRegion) {
    return d.id;
}

function regionLabelSelector(d: ProjectRegion) {
    return d.title;
}

interface Props {
    className?: string;
    projectId: string;
    tempGeoAreas?: string[] | undefined;
    onChange: (value: string[] | undefined) => void,
    geoAreaOptions: GeoArea[] | null | undefined;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | null | undefined>>;
}

function GeoLocationMapInput(props: Props) {
    const {
        projectId,
        className,
        tempGeoAreas,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        onChange,
    } = props;

    const [selectedRegion, setSelectedRegion] = useState<string>();
    const [selectedAdminLevel, setSelectedAdminLevel] = useState<AdminLevel>();

    const [
        getGeoAreas,
    ] = useLazyQuery<ProjectGeoAreasQuery, ProjectGeoAreasQueryVariables>(
        GEOAREAS,
        {
            onCompleted: (data) => {
                onGeoAreaOptionsChange(data.project?.geoAreas?.results);
            },
        },
    );

    const variables = useMemo(() => ({
        projectId,
    }
    ), [projectId]);

    const {
        data: projectRegions,
        loading: projectRegionsPending,
    } = useQuery<ProjectRegionsQuery, ProjectRegionsQueryVariables>(
        PROJECT_REGIONS,
        {
            skip: !projectId,
            variables,
            onCompleted: (data) => {
                const [topRegion] = data.project?.regions ?? [];
                const [topAdminLevel] = topRegion.adminLevels ?? [];
                setSelectedRegion(topRegion.id);
                setSelectedAdminLevel(topAdminLevel);
            },
        },
    );

    const adminLevels = projectRegions?.project?.regions
        ?.filter((v) => v.id === selectedRegion)
        .map((r) => r.adminLevels)
        .flat()
        .filter(isDefined);

    const handleGeoAreasMapSelection = useCallback((values: string[]) => {
        onChange(values);
        getGeoAreas({
            variables: {
                ids: values,
                projectId,
            },
        });
    }, [onChange, getGeoAreas, projectId]);

    const handleAdminLevelChange = useCallback((value: string) => {
        const adminLevel = adminLevels?.find((v) => v.id === value);
        setSelectedAdminLevel(adminLevel);
    }, [adminLevels]);

    const handleRemoveItem = useCallback((value: string) => {
        const newValues = tempGeoAreas?.filter((v) => (v !== value));
        onChange(newValues);
    }, [onChange, tempGeoAreas]);

    const geoAreaGroupRendererParams = useCallback((key: string) => ({
        heading: key,
        headingSize: 'extraSmall',
    }), []);

    const geoAreasRendererParams = useCallback((_: string, geoArea: GeoArea) => ({
        id: `${geoArea.id}`,
        value: `${geoArea.regionTitle}/${geoArea.adminLevelTitle}/${geoArea.title}`,
        onDismiss: handleRemoveItem,
    }), [handleRemoveItem]);

    const geoAreasList = useMemo(() => (
        tempGeoAreas
            ?.map((val: string) => geoAreaOptions?.find((v) => v.id === val))
            .filter(isDefined)
    ), [geoAreaOptions, tempGeoAreas]);

    return (
        <div className={_cs(className, styles.geoLocationMapInput)}>
            <div className={styles.mapSelection}>
                <div className={styles.inputs}>
                    <SelectInput
                        className={_cs(
                            styles.regionSelect,
                        )}
                        name="regionSelect"
                        onChange={setSelectedRegion}
                        options={projectRegions?.project?.regions}
                        keySelector={regionKeySelector}
                        labelSelector={regionLabelSelector}
                        value={selectedRegion}
                        label="Geo Area"
                        disabled={projectRegionsPending}
                    />
                    <GeoMultiSelectInput
                        name="geoSelection"
                        value={tempGeoAreas}
                        onChange={onChange}
                        label=" Geo Locations"
                        projectId={projectId}
                        options={geoAreaOptions}
                        onOptionsChange={onGeoAreaOptionsChange}
                        placeholder="Select geo locations"
                    />
                </div>
                <GeoLocationMap
                    className={styles.map}
                    adminLevel={selectedAdminLevel}
                    onAdminLevelChange={handleAdminLevelChange}
                    adminLevels={adminLevels}
                    selectedGeoAreas={tempGeoAreas}
                    onGeoAreasSelectionChange={handleGeoAreasMapSelection}
                    pending={projectRegionsPending}
                />
            </div>
            <Container
                className={styles.selectedGeoAreas}
                heading="Selected Geo Areas"
                headingSize="small"
            >
                <ListView
                    groupKeySelector={geoAreaGroupKeySelector}
                    groupRenderer={ContainerCard}
                    groupRendererClassName={styles.geoAreaGroup}
                    grouped
                    groupRendererParams={geoAreaGroupRendererParams}
                    data={geoAreasList}
                    renderer={GeoAreaListItem}
                    keySelector={geoAreaKeySelector}
                    emptyIcon={null}
                    emptyMessage={null}
                    rendererParams={geoAreasRendererParams}
                />
            </Container>
        </div>
    );
}

export default GeoLocationMapInput;
