import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoMapOutline } from 'react-icons/io5';
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

import {
    ProjectDetails,
} from '#types';
import _ts from '#ts';
import RegionSelectInput, { Region } from '#components/selections/RegionSelectInput';
import { useLazyRequest } from '#base/utils/restRequest';

import RegionTabPanel from './RegionTabPanel';

import styles from './styles.css';

const regionKeySelector = (d: Region) => d.id;

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

    interface RegionPatchCtx {
        newRegion: number,
        body: {
            regions: { id: number | string }[],
        },
    }

    const {
        trigger: regionPatchTrigger,
    } = useLazyRequest<ProjectDetails, RegionPatchCtx>({
        url: `server://projects/${projectId}/`,
        method: 'PATCH',
        body: (ctx) => ctx.body,
        onSuccess: (_, ctx) => {
            alert.show(
                'Successfully added geo area to the project.',
                { variant: 'success' },
            );
            onActiveRegionChange(ctx.newRegion.toString());
            onRegionAdd();
        },
    });

    const handleAddRegionConfirm = useCallback(
        (value: number | undefined) => {
            if (regions && value) {
                regionPatchTrigger({
                    newRegion: value,
                    body: {
                        regions: [
                            ...regions.map((d) => ({ id: d.id })),
                            { id: value },
                        ],
                    },
                });
            }
        },
        [regionPatchTrigger, regions],
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
                    {/* FIXME: show pending message */}
                    <RegionSelectInput
                        className={styles.region}
                        name="regions"
                        projectId={projectId}
                        value={undefined}
                        onChange={onRegionSelect}
                        options={regionOptions}
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
