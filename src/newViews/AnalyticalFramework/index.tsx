import React from 'react';
import { connect } from 'react-redux';
import { isNotDefined } from '@togglecorp/fujs';
import FullPageHeader from '#newComponents/ui/FullPageHeader';
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
} from '#types';

import {
    currentHash,
} from '#utils/safeCommon';
import {
    analyticalFrameworkIdFromRouteSelector,
} from '#redux';
import FrameworkDetails from './FrameworkDetails';
import PrimaryTagging from './PrimaryTagging';
import SecondaryTagging from './SecondaryTagging';
import Review from './Review';
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

function AnalyticalFramework(props: Props & PropsFromState) {
    const {
        frameworkId,
        activeFramework,
    } = props;

    return (
        <div className={styles.analyticalFramework}>
            <Tabs
                useHash
                defaultHash="framework-details"
            >
                <FullPageHeader
                    className={styles.header}
                    actionsClassName={styles.actions}
                    heading={frameworkId ? activeFramework?.title : _ts('analyticalFramework', 'addNewAnalyticalFramework')}
                    contentClassName={styles.content}
                    actions={(
                        <>
                            {currentHash() !== 'framework-details' && (
                                <Button
                                    name={undefined}
                                    variant="tertiary"
                                    disabled
                                >
                                    {_ts('analyticalFramework', 'saveButtonLabel')}
                                </Button>
                            )}
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
                            name="framework-details"
                            className={styles.tab}
                            activeClassName={styles.activeTab}
                        >
                            {_ts('analyticalFramework', 'frameworkDetails')}
                        </Tab>
                        <Tab
                            name="primary-tagging"
                            className={styles.tab}
                            disabled={isNotDefined(frameworkId)}
                            activeClassName={styles.activeTab}
                        >
                            {_ts('analyticalFramework', 'primaryTagging')}
                        </Tab>
                        <Tab
                            name="secondary-tagging"
                            className={styles.tab}
                            activeClassName={styles.activeTab}
                            disabled={isNotDefined(frameworkId)}
                        >
                            {_ts('analyticalFramework', 'secondaryTagging')}
                        </Tab>
                        <Tab
                            name="review"
                            className={styles.tab}
                            activeClassName={styles.activeTab}
                            disabled={isNotDefined(frameworkId)}
                        >
                            {_ts('analyticalFramework', 'review')}
                        </Tab>
                    </TabList>
                </FullPageHeader>
                <TabPanel
                    className={styles.tabPanel}
                    name="framework-details"
                >
                    <FrameworkDetails
                        // className={styles.view}
                        frameworkId={frameworkId}
                    />
                </TabPanel>
                <TabPanel
                    className={styles.tabPanel}
                    name="primary-tagging"
                >
                    <PrimaryTagging
                        className={styles.view}
                        frameworkId={frameworkId}
                    />
                </TabPanel>
                <TabPanel
                    className={styles.tabPanel}
                    name="secondary-tagging"
                >
                    <SecondaryTagging
                        className={styles.view}
                        frameworkId={frameworkId}
                    />
                </TabPanel>
                <TabPanel
                    className={styles.tabPanel}
                    name="review"
                >
                    <Review
                        className={styles.view}
                    />
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default connect(mapStateToProps)(AnalyticalFramework);
