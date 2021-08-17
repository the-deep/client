import React, { useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
    Tabs,
    ButtonLikeLink,
} from '@the-deep/deep-ui';

import PreloadMessage from '#base/components/PreloadMessage';
import SubNavbar from '#components/SubNavbar';
import SubNavbarContext from '#components/SubNavbar/context';
import _ts from '#ts';
import {
    CurrentFrameworkQuery,
    CurrentFrameworkQueryVariables,
} from '#generated/types';

import FrameworkForm from './FrameworkForm';
import { CURRENT_FRAMEWORK } from './queries';
import styles from './styles.css';

interface Props {
    className?: string;
}

function AnalyticalFramework(props: Props) {
    const {
        className,
    } = props;

    const [childrenNode, setChildrenNode] = useState<Element | null | undefined>();
    const [actionsNode, setActionsNode] = useState<Element | null | undefined>();
    const navbarContextValue = useMemo(
        () => ({
            childrenNode,
            actionsNode,
            setChildrenNode,
            setActionsNode,
        }),
        [childrenNode, actionsNode],
    );

    const { frameworkId: frameworkIdFromParams } = useParams<{ frameworkId: string }>();

    const frameworkId = !frameworkIdFromParams ? undefined : +frameworkIdFromParams;
    const createMode = !frameworkIdFromParams;

    const variables = useMemo(
        (): CurrentFrameworkQueryVariables => ({
            id: frameworkIdFromParams,
        }),
        [frameworkIdFromParams],
    );
    const {
        loading,
        error,
        data,
    } = useQuery<CurrentFrameworkQuery, CurrentFrameworkQueryVariables>(
        CURRENT_FRAMEWORK,
        {
            skip: createMode,
            variables,
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

    const framework = data?.analysisFramework ?? undefined;
    const hasPermission = createMode
        ? true
        : framework?.allowedPermissions?.includes('CAN_EDIT_FRAMEWORK');

    return (
        <div className={_cs(styles.analyticalFramework, className)}>
            <SubNavbarContext.Provider value={navbarContextValue}>
                <Tabs
                    useHash
                    defaultHash="framework-details"
                >
                    <SubNavbar
                        className={styles.header}
                        heading={(
                            createMode
                                ? _ts('analyticalFramework', 'addNewAnalyticalFramework')
                                : framework?.title
                        )}
                        defaultActions={(
                            <ButtonLikeLink
                                variant="tertiary"
                                to="/"
                            >
                                {_ts('analyticalFramework', 'closeButtonLabel')}
                            </ButtonLikeLink>
                        )}
                    />
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
            </SubNavbarContext.Provider>
        </div>
    );
}

export default AnalyticalFramework;
