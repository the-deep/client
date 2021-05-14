import React, { useState } from 'react';
import { connect } from 'react-redux';
import { isNotDefined } from '@togglecorp/fujs';
import FullPageHeader from '#dui/FullPageHeader';
import {
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
import FrameworkDetails from './FrameworkDetails';
import PrimaryTagging from './PrimaryTagging';
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

    const [activeTab, setActiveTab] = useState<TabNames>('primaryTagging');

    return (
        <div className={styles.analyticalFramework}>
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
            >
                <FullPageHeader
                    className={styles.header}
                    actionsClassName={styles.actions}
                    heading={frameworkId ? activeFramework?.title : _ts('analyticalFramework', 'addNewAnalyticalFramework')}
                    contentClassName={styles.content}
                    actions={(
                        <>
                            <Button
                                name={undefined}
                                variant="tertiary"
                                disabled
                            >
                                {_ts('analyticalFramework', 'saveButtonLabel')}
                            </Button>
                            <ButtonLikeLink
                                variant="tertiary"
                                to="/"
                            >
                                {_ts('analyticalFramework', 'closeButtonLabel')}
                            </ButtonLikeLink>
                        </>
                    )}
                >
                    <TabList className={styles.tabList}>
                        <Tab
                            name="frameworkDetails"
                            className={styles.tab}
                            activeClassName={styles.activeTab}
                        >
                            {_ts('analyticalFramework', 'frameworkDetails')}
                        </Tab>
                        <Tab
                            name="primaryTagging"
                            className={styles.tab}
                            disabled={isNotDefined(frameworkId)}
                            activeClassName={styles.activeTab}
                        >
                            {_ts('analyticalFramework', 'primaryTagging')}
                        </Tab>
                        <Tab
                            name="secondaryTagging"
                            className={styles.tab}
                            disabled={isNotDefined(frameworkId)}
                            activeClassName={styles.activeTab}
                        >
                            {_ts('analyticalFramework', 'secondaryTagging')}
                        </Tab>
                        <Tab
                            name="review"
                            className={styles.tab}
                            disabled={isNotDefined(frameworkId)}
                            activeClassName={styles.activeTab}
                        >
                            {_ts('analyticalFramework', 'review')}
                        </Tab>
                    </TabList>
                </FullPageHeader>
                <TabPanel
                    className={styles.tabPanel}
                    name="frameworkDetails"
                >
                    <FrameworkDetails
                        // className={styles.view}
                        frameworkId={frameworkId}
                    />
                </TabPanel>
                <TabPanel
                    className={styles.tabPanel}
                    name="primaryTagging"
                >
                    <PrimaryTagging
                        className={styles.view}
                        frameworkId={frameworkId}
                    />
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
