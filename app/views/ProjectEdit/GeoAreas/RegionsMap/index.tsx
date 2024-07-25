import React, { useCallback, useState } from 'react';
import { IoMapOutline } from 'react-icons/io5';
import { gql, useMutation } from '@apollo/client';
import { _cs, isDefined } from '@togglecorp/fujs';
import {
    Tabs,
    Tab,
    useAlert,
    TabList,
    ContainerCard,
    List,
    useConfirmation,
    Message,
    Kraken,
} from '@the-deep/deep-ui';

import _ts from '#ts';
import RegionSelectInput, { Region } from '#components/selections/RegionSelectInput';
import { PatchRegionMutation, PatchRegionMutationVariables } from '#generated/types';

import RegionTabPanel from './RegionTabPanel';

import styles from './styles.css';

const regionKeySelector = (d: Region) => d.id;

const PATCH_REGION = gql`
    mutation PatchRegion($projectId: ID!, $regionId: [ID!]) {
        project(id: $projectId) {
            projectRegionBulk(regionsToAdd: $regionId) {
                errors
                result {
                    id
                }
            }
        }
    }
`;

interface Props {
    className?: string;
    projectId: string;

    regions?: Region[];
    onRegionAdd: () => void;
    regionsPending?: boolean;

    activeAdminLevel: string | undefined;
    onActiveAdminLevelChange: (val: string | undefined) => void;

    activeRegion: string | undefined;
    onActiveRegionChange: (val: string | undefined) => void;

    navigationDisabled?: boolean;
    triggerId?: number;
}

function RegionsMap(props: Props) {
    const {
        className,
        projectId,
        regions = [],
        onRegionAdd,
        activeAdminLevel,
        onActiveAdminLevelChange,
        activeRegion,
        onActiveRegionChange,
        navigationDisabled,
        triggerId,
        regionsPending,
    } = props;

    // NOTE: idk if this is required
    const [regionOptions, setRegionOptions] = useState<Region[] | null | undefined>(undefined);
    const alert = useAlert();

    const [
        patchRegion,
        {
            loading: pendingPatchRegion,
        },
    ] = useMutation<PatchRegionMutation, PatchRegionMutationVariables>(
        PATCH_REGION,
        {
            onCompleted: (response) => {
                if (!response.project?.projectRegionBulk) {
                    return;
                }

                const {
                    result,
                    errors,
                } = response.project.projectRegionBulk;

                if (errors) {
                    alert.show(
                        'Failed to publish selected region.',
                        { variant: 'error' },
                    );
                }

                const ok = isDefined(result) && result?.length > 0;

                if (ok) {
                    alert.show(
                        'Region is successfully added!',
                        { variant: 'success' },
                    );
                    onRegionAdd();
                }
            },
            onError: () => {
                alert.show(
                    'Failed to add selected region.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleAddRegionConfirm = useCallback(
        (value: number | undefined) => {
            if (value) {
                // NOTE: Mutation only requires selected region for the patch not the entire list.
                patchRegion({
                    variables: {
                        projectId,
                        regionId: [String(value)],
                    },
                });
            }
        },
        [patchRegion, projectId],
    );

    const [
        modal,
        onRegionSelect,
    ] = useConfirmation<number>({
        showConfirmationInitially: false,
        onConfirm: handleAddRegionConfirm,
        message: 'Are you sure you want to add this geo area to the project?',
    });

    const tabRendererParams = useCallback(
        (id: string, data: Region) => ({
            name: id,
            children: data.title,
            transparentBorder: true,
        }),
        [],
    );

    const regionTabPanelRendererParams = useCallback(
        (id: string) => ({
            id,
            activeAdminLevel,
            onActiveAdminLevelChange,
            navigationDisabled,
            triggerId,
        }),
        [activeAdminLevel, onActiveAdminLevelChange, navigationDisabled, triggerId],
    );

    return (
        <>
            <Tabs
                value={activeRegion}
                onChange={onActiveRegionChange}
                disabled={navigationDisabled}
            >
                <ContainerCard
                    className={_cs(styles.regionsPane, className)}
                    spacing="none"
                    heading={_ts('geoAreas', 'projectMaps')}
                    headingSize="medium"
                    contentClassName={styles.tabPanelContainer}
                    headerClassName={styles.header}
                    headingContainerClassName={styles.headingContainer}
                    headerActionsContainerClassName={styles.headerActions}
                    headerActions={(
                        <TabList className={styles.tabList}>
                            <List
                                data={regions}
                                rendererParams={tabRendererParams}
                                renderer={Tab}
                                rendererClassName={styles.tab}
                                keySelector={regionKeySelector}
                            />
                        </TabList>
                    )}
                >
                    <RegionSelectInput
                        className={styles.region}
                        name="regions"
                        projectId={projectId}
                        value={undefined}
                        onChange={onRegionSelect}
                        options={regionOptions}
                        pending={pendingPatchRegion}
                        onOptionsChange={setRegionOptions}
                        placeholder="Add Geo area"
                        variant="general"
                        nonClearable
                        disabled={navigationDisabled}
                    />
                    {!regionsPending && (regions.length ?? 0) < 1 && (
                        <div className={_cs(styles.message, className)}>
                            <Message
                                icon={
                                    <Kraken variant="sleep" />
                                }
                                message={_ts('geoAreas', 'noGeoAreas')}
                            />
                        </div>
                    )}
                    {/* FIXME: show pending message */}
                    {!regionsPending && (regions.length ?? 0) > 0 && !activeRegion && (
                        <div className={_cs(styles.message, className)}>
                            <IoMapOutline className={styles.icon} />
                            No region selected
                        </div>
                    )}
                    <List
                        data={regions}
                        rendererParams={regionTabPanelRendererParams}
                        renderer={RegionTabPanel}
                        rendererClassName={styles.tabPanel}
                        keySelector={regionKeySelector}
                    />
                </ContainerCard>
            </Tabs>
            {modal}
        </>
    );
}

export default RegionsMap;
