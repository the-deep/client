import React, { useMemo, useCallback, useState } from 'react';
import {
    _cs,
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

import { useLazyRequest } from '#utils/request';
import notify from '#notify';

import AddAdminLevelForm from './AddAdminLevelForm';
import styles from './styles.scss';

interface TabDetails {
    name: string;
    children: string;
}
const defaultTab: TabDetails[] = [
    {
        name: 'adminLevel1',
        children: 'Admin Level 1',
    },
];

const tabKeySelector = (d: TabDetails) => d.name;

interface Props {
    activeRegion: number;
    onSuccess: () => void;
}

function AddAdminLevel(props: Props) {
    const {
        activeRegion,
        onSuccess,
    } = props;

    const [activeTab, setActiveTab] = useState('adminLevel1');
    const [tab, setTab] = useState(defaultTab);

    const adminLevelQuery = useMemo(() => ({
        region: activeRegion,
    }), [activeRegion]);

    const {
        pending: publishAdminLevelPending,
        trigger: publishAdminLevelTrigger,
    } = useLazyRequest({
        url: 'server://admin-levels/',
        method: 'PUT',
        query: adminLevelQuery,
        body: { isPublished: true },
        onSuccess: () => {
            onSuccess();
            notify.send({
                title: 'Publish Geo Areas',
                type: notify.type.SUCCESS,
                message: 'Successfully published Geo Area',
                duration: notify.duration.MEDIUM,
            });
        },
        failureHeader: 'Failed to publish Geo Area',
    });

    const tabListRendererParams = useCallback((key, data) => ({
        name: data.name,
        children: data.children,
    }), []);

    const tabPanelRendererParams = useCallback((_, data) => ({
        name: data.name,
        children: <AddAdminLevelForm
            activeRegion={activeRegion}
            onSuccess={onSuccess}
        />,
    }), [activeRegion, onSuccess]);

    const handleAdminLevelAdd = useCallback(() => {
        setTab(oldTab => ([...oldTab, {
            name: _cs('adminLevel', (oldTab.length + 1).toString()),
            children: _cs('Admin Level ', (oldTab.length + 1).toString()),
        }]));
    }, [setTab]);


    const handlePublishGeoArea = useCallback(() => {
        publishAdminLevelTrigger(null);
    }, [publishAdminLevelTrigger]);


    return (
        <ContainerCard
            className={styles.formContainer}
            heading="Custom Admin Levels"
            contentClassName={styles.content}
            footerActions={(
                <ConfirmButton
                    name="submit"
                    onClick={handlePublishGeoArea}
                    disabled={publishAdminLevelPending}
                >
                    Publish Geo Area
                </ConfirmButton>
            )}
        >
            <Button
                name="addAdminLevel"
                className={styles.submit}
                onClick={handleAdminLevelAdd}
                variant="tertiary"
                icons={<IoAdd />}
            >
                Add Admin Level
            </Button>
            <Tabs
                onChange={setActiveTab}
                value={activeTab}
            >
                <TabList>
                    <List
                        data={tab}
                        keySelector={tabKeySelector}
                        rendererParams={tabListRendererParams}
                        renderer={Tab}
                    />
                </TabList>
                <List
                    data={tab}
                    keySelector={tabKeySelector}
                    rendererParams={tabPanelRendererParams}
                    renderer={TabPanel}
                />
            </Tabs>
        </ContainerCard>
    );
}

export default AddAdminLevel;
