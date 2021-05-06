import React, { useState } from 'react';
import { connect } from 'react-redux';
import { isNotDefined } from '@togglecorp/fujs';
import { IoChevronBack } from 'react-icons/io5';
import {
    Header,
    Button,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    ButtonLikeLink,
} from '@the-deep/deep-ui';

import _ts from '#ts';
import {
    FrameworkFields,
    AppState,
} from '#typings';

import {
    analyticalFrameworkIdFromRouteSelector,
} from '#redux';
import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    frameworkId: analyticalFrameworkIdFromRouteSelector(state),
});

interface PropsFromState {
    frameworkId: number;
}
interface Props {
    activeFramework: FrameworkFields;
}

type TabNames = 'frameworkDetails' | 'primaryTagging' | 'secondaryTagging' | 'review';

function AnalyticalFramework(props: Props & PropsFromState) {
    const {
        frameworkId,
        activeFramework,
    } = props;
    const [activeTab, setActiveTab] = useState<TabNames>('frameworkDetails');

    return (
        <div
            className={styles.analyticalFramework}
        >
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
            >
                <Header
                    className={styles.header}
                    icons={(
                        <ButtonLikeLink
                            variant="tertiary"
                            icons={<IoChevronBack />}
                            to="/"
                        >
                            {_ts('analyticalFramework', 'closeButtonLabel')}
                        </ButtonLikeLink>
                    )}
                    actions={(
                        <Button
                            name={undefined}
                            variant="tertiary"
                            disabled
                        >
                            {_ts('analyticalFramework', 'saveButtonLabel')}
                        </Button>
                    )}
                    heading={frameworkId ? activeFramework?.title : _ts('analyticalFramework', 'addNewAnalyticalFramework')}
                />
                <TabList className={styles.tabList}>
                    <Tab
                        name="frameworkDetails"
                        className={styles.tab}
                    >
                        {_ts('analyticalFramework', 'frameworkDetails')}
                    </Tab>
                    <Tab
                        name="primaryTagging"
                        className={styles.tab}
                        disabled={isNotDefined(frameworkId)}
                    >
                        {_ts('analyticalFramework', 'primaryTagging')}
                    </Tab>
                    <Tab
                        name="secondaryTagging"
                        className={styles.tab}
                        disabled={isNotDefined(frameworkId)}
                    >
                        {_ts('analyticalFramework', 'secondaryTagging')}
                    </Tab>
                    <Tab
                        name="review"
                        className={styles.tab}
                        disabled={isNotDefined(frameworkId)}
                    >
                        {_ts('analyticalFramework', 'review')}
                    </Tab>
                </TabList>
                <TabPanel
                    className={styles.tabPanel}
                    name="frameworkDetails"
                >
                    {_ts('analyticalFramework', 'frameworkDetails')}
                </TabPanel>
                <TabPanel
                    className={styles.tabPanel}
                    name="primaryTagging"
                >
                    {_ts('analyticalFramework', 'primaryTagging')}
                </TabPanel>
                <TabPanel
                    className={styles.tabPanel}
                    name="secondaryTagging"
                >
                    {_ts('analyticalFramework', 'secondaryTagging')}
                </TabPanel>
                <TabPanel
                    className={styles.tabPanel}
                    name="review"
                >
                    {_ts('analyticalFramework', 'review')}
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default connect(mapStateToProps)(AnalyticalFramework);
