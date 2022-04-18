import React, { useState, useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    Container,
    SelectInput,
    ListView,
    ContainerCard,
    Kraken,
} from '@the-deep/deep-ui';
import GeoMultiSelectInput, { GeoArea } from '#components/GeoMultiSelectInput';
import {
    ProjectRegionsQuery,
    ProjectRegionsQueryVariables,
} from '#generated/types';

import { breadcrumb } from '#utils/common';
import RegionMap from '#components/region/RegionMap';

import GeoAreaListItem from './GeoAreaListItem';

import styles from './styles.css';

function geoAreaKeySelector(geoArea: GeoArea) {
    return geoArea.id;
}

const PROJECT_REGIONS = gql`
    query ProjectRegions($projectId: ID!) {
        project(id: $projectId) {
            id
            regions {
                title
                id
                isPublished
                adminLevels {
                    id
                    level
                    title
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
    value?: string[] | null | undefined;
    onChange: (value: string[] | undefined) => void,
    geoAreaOptions: GeoArea[] | null | undefined;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | null | undefined>>;
}

function GeoLocationMapInput(props: Props) {
    const {
        projectId,
        className,
        value,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        onChange,
    } = props;

    const [selectedRegion, setSelectedRegion] = useState<string>();
    const [
        activeAdminLevel,
        setActiveAdminLevel,
    ] = useState<string | undefined>();

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
                const [topRegion] = data.project?.regions?.filter(
                    (region) => region.isPublished,
                ) ?? [];
                const topAdminLevel = topRegion?.adminLevels?.find((v) => v.level === 0)
                    ?? topRegion?.adminLevels?.[0];

                setSelectedRegion(topRegion?.id);
                setActiveAdminLevel(topAdminLevel?.id);
            },
        },
    );

    const handleRegionChange = useCallback((newRegion: string | undefined) => {
        setSelectedRegion(newRegion);

        const selectedRegionDetails = projectRegions
            ?.project?.regions?.find((region) => region.id === newRegion);
        const topAdminLevel = selectedRegionDetails?.adminLevels?.find((v) => v.level === 0)
            ?? selectedRegionDetails?.adminLevels?.[0];

        setActiveAdminLevel(topAdminLevel?.id);
    }, [projectRegions]);

    const handleRemoveItem = useCallback((valueToRemove: string) => {
        const newValues = value?.filter((v) => (v !== valueToRemove));
        onChange(newValues);
    }, [onChange, value]);

    const geoAreaGroupRendererParams = useCallback((key: string) => ({
        heading: key,
        headingSize: 'extraSmall',
        spacing: 'compact',
    }), []);

    const geoAreasList = useMemo(() => (
        geoAreaOptions?.filter((item) => value?.includes(item.id))
    ), [geoAreaOptions, value]);

    const filteredProjectRegions = useMemo(() => (
        projectRegions?.project?.regions?.filter((region) => region.isPublished)
    ), [projectRegions?.project?.regions]);

    const geoAreasRendererParams = useCallback((_: string, geoArea: GeoArea) => {
        const label = breadcrumb(
            [
                (filteredProjectRegions?.length ?? 0) > 1 ? geoArea.regionTitle : undefined,
                geoArea.adminLevelTitle,
                geoArea.title,
            ].filter(isDefined),
        );

        return {
            id: `${geoArea.id}`,
            value: label,
            onDismiss: handleRemoveItem,
        };
    }, [
        handleRemoveItem,
        filteredProjectRegions,
    ]);

    const geoAreaGroupKeySelector = useCallback((geoArea: GeoArea) => {
        const label = breadcrumb(
            [
                (filteredProjectRegions?.length ?? 0) > 1 ? geoArea.regionTitle : undefined,
                geoArea.adminLevelTitle,
            ].filter(isDefined),
        );
        return label;
    }, [
        filteredProjectRegions,
    ]);

    return (
        <div className={_cs(className, styles.geoLocationMapInput)}>
            <div className={styles.mapSelection}>
                <div className={styles.inputs}>
                    <SelectInput
                        className={_cs(
                            styles.regionSelect,
                        )}
                        name="regionSelect"
                        onChange={handleRegionChange}
                        options={filteredProjectRegions}
                        keySelector={regionKeySelector}
                        labelSelector={regionLabelSelector}
                        value={selectedRegion}
                        label="Geo Area"
                        disabled={projectRegionsPending}
                    />
                    <GeoMultiSelectInput
                        className={styles.geoSelectionInput}
                        name="geoSelection"
                        value={value}
                        onChange={onChange}
                        label=" Geo Locations"
                        projectId={projectId}
                        options={geoAreaOptions}
                        onOptionsChange={onGeoAreaOptionsChange}
                        placeholder="Select geo locations"
                    />
                </div>
                <RegionMap
                    className={styles.map}
                    adminLevel={activeAdminLevel}
                    regionId={selectedRegion}
                    onAdminLevelChange={setActiveAdminLevel}
                    selectedGeoAreas={value}
                    showTooltip
                    onSelectedGeoAreasChange={onChange}
                    geoAreaOptions={geoAreaOptions}
                    onGeoAreaOptionsChange={onGeoAreaOptionsChange}
                />
            </div>
            <Container
                className={styles.selectedGeoAreas}
                heading="Selected Geo Areas"
                spacing="none"
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
                    rendererParams={geoAreasRendererParams}
                    filtered={false}
                    errored={false}
                    pending={false}
                    emptyIcon={(
                        <Kraken
                            variant="hi"
                        />
                    )}
                    emptyMessage="No geo areas selected."
                    messageIconShown
                    messageShown
                />
            </Container>
        </div>
    );
}

export default GeoLocationMapInput;
