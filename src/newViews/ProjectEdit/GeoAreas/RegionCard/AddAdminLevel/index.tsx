import React, { useMemo, useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import {
    ContainerCard,
    Button,
    ConfirmButton,
    Tabs,
    TabList,
    TabPanel,
    Tab,
    List,
} from '@the-deep/deep-ui';

import { useRequest } from '#utils/request';
import {
    MultiResponse,
    AdminLevelGeoArea,
    AdminLevel,
} from '#typings';

import AddAdminLevelForm from './AddAdminLevelForm';
import styles from './styles.scss';

const tabKeySelector = (d: AdminLevelGeoArea) => d.id.toString();

interface Props {
    className?: string;
    activeRegion: number;
    adminLevels: AdminLevel[];
    isPublished: boolean;
}

function AddAdminLevel(props: Props) {
    const {
        className,
        activeRegion,
        adminLevels: adminLevelFromProps,
        isPublished,
    } = props;

    const [activeTab, setActiveTab] = useState<string>();
    const [
        adminLevels,
        setAdminLevels,
    ] = useState<Partial<AdminLevelGeoArea>[]>(adminLevelFromProps);

    const handleAdminLevelAdd = useCallback(() => {
        setAdminLevels((oldAdminLevels) => {
            const newAdminLevel: Pick<AdminLevelGeoArea, 'id' | 'title' | 'region'> = {
                id: new Date().getUTCMilliseconds(),
                title: `Admin Level ${oldAdminLevels.length + 1}`,
                region: activeRegion,

            };
            setActiveTab(newAdminLevel.id.toString());
            return [
                newAdminLevel,
                ...oldAdminLevels,
            ];
        });
    }, [activeRegion]);

    const adminLevelQuery = useMemo(() => ({
        region: activeRegion,
    }), [activeRegion]);

    const {
        response: adminLevelOptions,
        retrigger: adminLevelTrigger,
    } = useRequest<MultiResponse<AdminLevelGeoArea>>({
        url: 'server://admin-levels/',
        query: adminLevelQuery,
        method: 'GET',
        onSuccess: (response) => {
            if (response.results.length > 0) {
                setAdminLevels(response.results);
                if (!activeTab) {
                    const [first] = response.results;
                    setActiveTab(first.id.toString());
                }
            }
        },
        failureHeader: 'Failed to fetch admin levels',
    });

    const handleAdminLevelSave = useCallback((id: number) => {
        setActiveTab(id.toString());
        adminLevelTrigger();
    }, [adminLevelTrigger]);

    const tabListRendererParams = useCallback((id: string, data: Partial<AdminLevelGeoArea>) => ({
        name: id,
        children: data.title,
    }), []);

    const tabPanelRendererParams = useCallback((id: string, value: Partial<AdminLevelGeoArea>) => ({
        name: id,
        children: (
            <AddAdminLevelForm
                value={value}
                onSuccess={handleAdminLevelSave}
                isPublished={isPublished}
                adminLevelOptions={adminLevelOptions?.results}
            />
        ),
    }), [
        handleAdminLevelSave,
        isPublished,
        adminLevelOptions,
    ]);

    const handlePublishGeoArea = useCallback(() => { // TODO add this later
    }, []);

    return (
        <ContainerCard
            className={_cs(className, styles.addAdminLevel)}
            heading="Custom Admin Levels"
            contentClassName={styles.content}
            footerActions={!isPublished && (
                <ConfirmButton
                    name="submit"
                    onClick={handlePublishGeoArea}
                    disabled
                >
                    Publish Geo Area
                </ConfirmButton>
            )}
        >
            {!isPublished && (
                <Button
                    name="addAdminLevel"
                    className={styles.submit}
                    onClick={handleAdminLevelAdd}
                    variant="tertiary"
                    icons={<IoAdd />}
                >
                    Add Admin Level
                </Button>
            )}
            {activeTab && (
                <Tabs
                    onChange={setActiveTab}
                    value={activeTab}
                >
                    <TabList
                        className={styles.tabs}
                    >
                        <List
                            data={adminLevels}
                            keySelector={tabKeySelector}
                            rendererParams={tabListRendererParams}
                            renderer={Tab}
                        />
                    </TabList>
                    <List
                        data={adminLevels}
                        keySelector={tabKeySelector}
                        rendererParams={tabPanelRendererParams}
                        renderer={TabPanel}
                    />
                </Tabs>
            )}
        </ContainerCard>
    );
}

export default AddAdminLevel;
