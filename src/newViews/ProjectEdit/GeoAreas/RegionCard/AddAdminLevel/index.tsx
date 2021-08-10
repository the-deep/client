import React, { useMemo, useCallback, useState } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
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

const tabKeySelector = (d: AdminLevelGeoArea) => d.clientId;

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
            const clientId = randomString();
            const newAdminLevel: Pick<AdminLevelGeoArea, 'title' | 'region' | 'clientId'> = {
                clientId,
                title: `Admin Level ${oldAdminLevels.length + 1}`,
                region: activeRegion,
            };
            setActiveTab(clientId);
            return [
                ...oldAdminLevels,
                newAdminLevel,
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
                const adminLevelsWithClientId = response.results.map(al => ({
                    ...al,
                    clientId: randomString(),
                }));
                setAdminLevels(adminLevelsWithClientId);
                if (!activeTab) {
                    const [first] = adminLevelsWithClientId;
                    setActiveTab(first.clientId);
                }
            }
        },
        failureHeader: 'Failed to fetch admin levels',
    });

    const handleAdminLevelSave = useCallback(() => {
        adminLevelTrigger();
    }, [adminLevelTrigger]);

    const tabListRendererParams = useCallback((key: string, data: Partial<AdminLevelGeoArea>) => ({
        name: key,
        children: data.title,
    }), []);

    const tabPanelRendererParams = useCallback((key: string, data: Partial<AdminLevelGeoArea>) => ({
        name: key,
        children: (
            <AddAdminLevelForm
                value={data}
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
