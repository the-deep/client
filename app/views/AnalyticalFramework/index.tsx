import React, { useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
    Button,
    Tabs,
    Tab,
    TabList,
    ButtonLikeLink,
} from '@the-deep/deep-ui';

import PreloadMessage from '#base/components/PreloadMessage';
import FullPageHeader from '#components/FullPageHeader';
import _ts from '#ts';
import {
    CurrentFrameworkQuery,
    CurrentFrameworkQueryVariables,
} from '#generated/types';

import FrameworkForm from './FrameworkForm';
import { Framework } from './types';
import { CURRENT_FRAMEWORK } from './queries';
import styles from './styles.css';

interface Props {
    className?: string;
}

function AnalyticalFramework(props: Props) {
    const {
        className,
    } = props;

    const { frameworkId: frameworkIdFromParams } = useParams<{ frameworkId: string }>();

    const frameworkId = !frameworkIdFromParams ? undefined : +frameworkIdFromParams;
    const createMode = !frameworkIdFromParams;

    const [framework, setFramework] = useState<Framework | undefined>();
    const [ready, setReady] = useState(createMode);

    const variables = useMemo(
        (): CurrentFrameworkQueryVariables => ({
            id: frameworkIdFromParams,
        }),
        [frameworkIdFromParams],
    );
    const { loading, error } = useQuery<CurrentFrameworkQuery, CurrentFrameworkQueryVariables>(
        CURRENT_FRAMEWORK,
        {
            skip: createMode,
            variables,
            onCompleted: (data) => {
                if (data.analysisFramework) {
                    setFramework(data.analysisFramework);
                    setReady(true);
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

    if (loading || !ready) {
        return (
            <PreloadMessage
                className={className}
                content="Checking framework permissions..."
            />
        );
    }

    const hasPermission = createMode
        ? true
        : framework?.allowedPermissions?.includes('CAN_EDIT_FRAMEWORK');

    return (
        <div className={_cs(styles.analyticalFramework, className)}>
            <Tabs
                useHash
                defaultHash="framework-details"
            >
                <FullPageHeader
                    className={styles.header}
                    heading={(
                        createMode
                            ? _ts('analyticalFramework', 'addNewAnalyticalFramework')
                            : framework?.title
                    )}
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
                    <TabList>
                        <Tab
                            name="framework-details"
                            disabled={!hasPermission}
                        >
                            {_ts('analyticalFramework', 'frameworkDetails')}
                        </Tab>
                        <Tab
                            name="primary-tagging"
                            disabled={!hasPermission}
                        >
                            {_ts('analyticalFramework', 'primaryTagging')}
                        </Tab>
                        <Tab
                            name="secondary-tagging"
                            disabled={!hasPermission}
                        >
                            {_ts('analyticalFramework', 'secondaryTagging')}
                        </Tab>
                        <Tab
                            name="review"
                            disabled={!hasPermission}
                        >
                            {_ts('analyticalFramework', 'review')}
                        </Tab>
                    </TabList>
                </FullPageHeader>
                {!hasPermission ? (
                    <PreloadMessage
                        heading="Oh no!"
                        content="The framework does not exist or you do not have permissions to edit the framework."
                    />
                ) : (
                    <FrameworkForm
                        framework={framework}
                        frameworkId={frameworkId}
                    />
                )}
            </Tabs>
        </div>
    );
}

export default AnalyticalFramework;
