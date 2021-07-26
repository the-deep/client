import React, { useCallback, useState } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { IoMapOutline } from 'react-icons/io5';
import {
    Tabs,
    Tab,
    TabList,
    Header,
    List,
    useConfirmation,
} from '@the-deep/deep-ui';

import {
    BasicRegion,
    Region,
    ProjectDetails,
} from '#typings';
import _ts from '#ts';
import RegionSelectInput from '#newComponents/input/RegionSelectInput';
import notify from '#notify';
import { useRequest, useLazyRequest } from '#utils/request';

import RegionTabPanel from './RegionTabPanel';

import styles from './styles.scss';

const regionKeySelector = (d: Region) => d.id.toString();

interface Props {
    className?: string;
    activeProject: number;
}

function RegionMapList(props: Props) {
    const {
        className,
        activeProject,
    } = props;

    const [selectedRegion, setSelectedRegion] = useState<number | undefined>(undefined);
    const [regionOptions, setRegionOptions] = useState<Region[] | null | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<string>('');

    const {
        response: regionResponse,
        retrigger: regionsGetTrigger,
    } = useRequest<{ regions: Region[] }>({
        url: `server://projects/${activeProject}/regions/`,
        method: 'GET',
        onSuccess: (response) => {
            setActiveTab(response.regions[0]?.id.toString());
        },
        failureHeader: 'Regions List',
    });

    const {
        trigger: regionPatchTrigger,
    } = useLazyRequest<ProjectDetails, { regions: { id: number | string }[]}>({
        url: `server://projects/${activeProject}/`,
        method: 'PATCH',
        body: ctx => ctx,
        onSuccess: () => {
            notify.send({
                title: 'Add Regions',
                type: notify.type.SUCCESS,
                message: 'Successfully added regions',
                duration: notify.duration.MEDIUM,
            });
            regionsGetTrigger();
        },
    });

    const handleAddRegionConfirm = useCallback(() => {
        if (selectedRegion && regionResponse) {
            regionPatchTrigger({
                regions: [
                    ...regionResponse.regions.map(d => ({ id: d.id })),
                    { id: selectedRegion },
                ],
            });
        }
        setSelectedRegion(undefined);
    }, [selectedRegion, regionPatchTrigger, regionResponse]);

    const [
        modal,
        onRegionSelect,
    ] = useConfirmation({
        showConfirmationInitially: false,
        onConfirm: handleAddRegionConfirm,
        message: 'Are you sure you want to add this region?',
    });

    const handleRegionSelectChange = useCallback((val: number) => {
        setSelectedRegion(val);
        if (onRegionSelect) {
            onRegionSelect(); // NOTE: Type error from deep-ui
        }
    }, [onRegionSelect]);

    const tabRendererParams = useCallback((id: string, data: BasicRegion) => ({
        name: id,
        children: data.title,
    }), []);

    const regionTabPanelRendererParams = useCallback((id: string) => ({
        id,
    }), []);

    return (
        <div className={_cs(styles.regionMapList, className)}>
            <RegionSelectInput
                className={styles.region}
                name="regions"
                activeProject={activeProject}
                value={undefined}
                onChange={handleRegionSelectChange}
                options={regionOptions}
                onOptionsChange={setRegionOptions}
                placeholder="Add Geo area"
                variant="general"
                nonClearable
            />
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
            >
                <Header
                    className={styles.header}
                    heading={_ts('geoAreas', 'projectMaps')}
                    headingSize="medium"
                    childrenContainerClassName={styles.tabs}
                >
                    <TabList>
                        <List
                            data={regionResponse?.regions}
                            rendererParams={tabRendererParams}
                            renderer={Tab}
                            keySelector={regionKeySelector}
                        />
                    </TabList>
                </Header>
                <div className={styles.tabPanelContainer}>
                    {regionResponse && regionResponse.regions?.length < 1 && (
                        <div className={_cs(styles.message, className)}>
                            <IoMapOutline className={styles.icon} />
                            {_ts('geoAreas', 'noGeoAreas')}
                        </div>
                    )}
                    <List
                        data={regionResponse?.regions}
                        rendererParams={regionTabPanelRendererParams}
                        renderer={RegionTabPanel}
                        rendererClassName={styles.tabPanel}
                        keySelector={regionKeySelector}
                    />
                </div>
            </Tabs>
            {modal}
        </div>
    );
}

export default RegionMapList;
