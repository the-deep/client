import React, { useState, useMemo } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import {
    Button,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    ButtonLikeLink,
} from '@the-deep/deep-ui';

import PreloadMessage from '#base/components/PreloadMessage';
import FullPageHeader from '#components/FullPageHeader';
import _ts from '#ts';

import {
    currentHash,
} from '#utils/common';
import {
    CurrentFrameworkQuery,
    CurrentFrameworkQueryVariables,
} from '#generated/types';

import FrameworkDetails from './FrameworkDetails';
import PrimaryTagging from './PrimaryTagging';
import SecondaryTagging from './SecondaryTagging';
import Review from './Review';

import styles from './styles.css';

const CURRENT_FRAMEWORK = gql`
    query CurrentFramework($id: ID!) {
        analysisFramework(id: $id) {
            id
            title
            allowedPermissions
        }
    }
`;

export type Framework = Omit<NonNullable<CurrentFrameworkQuery['analysisFramework']>, '__typename'>;

interface Props {
    className?: string;
}

function AnalyticalFramework(props: Props) {
    const {
        className,
    } = props;
    const [framework, setFramework] = useState<Framework | undefined>();
    const { frameworkId: frameworkIdFromParams } = useParams<{ frameworkId: string }>();
    const frameworkId = +frameworkIdFromParams;

    const variables = useMemo(
        (): CurrentFrameworkQueryVariables => ({
            id: frameworkIdFromParams,
        }),
        [frameworkIdFromParams],
    );
    const { loading, error } = useQuery<CurrentFrameworkQuery, CurrentFrameworkQueryVariables>(
        CURRENT_FRAMEWORK,
        {
            variables,
            onCompleted: (data) => {
                if (data.analysisFramework) {
                    setFramework(data.analysisFramework);
                }
            },
        },
    );

    if (error) {
        return (
            <PreloadMessage
                className={className}
                heading="Oh no!"
                content="Some error occurred"
            />
        );
    }

    if (loading) {
        return (
            <PreloadMessage
                className={className}
                content="Checking framework permissions..."
            />
        );
    }

    const hasEditPermission = framework?.allowedPermissions?.includes('CAN_EDIT_FRAMEWORK');

    return (
        <div className={_cs(styles.analyticalFramework, className)}>
            <Tabs
                useHash
                defaultHash="framework-details"
            >
                <FullPageHeader
                    className={styles.header}
                    heading={frameworkId ? framework?.title : _ts('analyticalFramework', 'addNewAnalyticalFramework')}
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
                    <TabList>
                        <Tab
                            name="framework-details"
                            disabled={!hasEditPermission}
                        >
                            {_ts('analyticalFramework', 'frameworkDetails')}
                        </Tab>
                        <Tab
                            name="primary-tagging"
                            disabled={isNotDefined(frameworkId) || !hasEditPermission}
                        >
                            {_ts('analyticalFramework', 'primaryTagging')}
                        </Tab>
                        <Tab
                            name="secondary-tagging"
                            disabled={isNotDefined(frameworkId) || !hasEditPermission}
                        >
                            {_ts('analyticalFramework', 'secondaryTagging')}
                        </Tab>
                        <Tab
                            name="review"
                            disabled={isNotDefined(frameworkId) || !hasEditPermission}
                        >
                            {_ts('analyticalFramework', 'review')}
                        </Tab>
                    </TabList>
                </FullPageHeader>
                {hasEditPermission ? (
                    <>
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
                    </>
                ) : (
                    <PreloadMessage
                        heading="Oh no!"
                        content="The framework does not exist or you do not have permissions to edit the framework."
                    />
                )}
            </Tabs>
        </div>
    );
}

export default AnalyticalFramework;
