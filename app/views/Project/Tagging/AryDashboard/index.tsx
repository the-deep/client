import React, { useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    PendingMessage,
    Kraken,
    Message,
    Container,
} from '@the-deep/deep-ui';
import {
    prepareUrlParams,
} from '@togglecorp/toggle-request';
import {
    gql,
    useQuery,
} from '@apollo/client';

import ProjectContext from '#base/context/ProjectContext';
import {
    ProjectVizQuery,
    ProjectVizQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const vizRendererUrl = process.env.REACT_APP_ASSESSMENT_VIZ_URL || 'https://the-deep.github.io/deepviz-assessmente/';

const PROJECT_VIZ = gql`
    query ProjectViz($projectId: ID!) {
        project(id: $projectId) {
            id
            vizData {
                dataUrl
                publicUrl
                publicShare
                status
            }
        }
    }
`;

interface Props {
    className?: string;
}

function AryDashboard(props: Props) {
    const {
        className,
    } = props;

    const { project } = React.useContext(ProjectContext);
    const activeProject = project?.id;

    const variables = useMemo(() => (activeProject ? ({
        projectId: activeProject,
    }) : undefined), [activeProject]);

    const {
        data,
        loading,
    } = useQuery<ProjectVizQuery, ProjectVizQueryVariables>(
        PROJECT_VIZ,
        {
            skip: !activeProject,
            variables,
        },
    );

    const vizUrl = useMemo(() => (
        `${vizRendererUrl}?${prepareUrlParams({ dataUrl: data?.project?.vizData?.dataUrl })}`
    ), [data]);

    const status = data?.project?.vizData?.status;
    const dataUrl = data?.project?.vizData?.dataUrl;

    return (
        <Container
            className={_cs(styles.dashboard, className)}
            contentClassName={styles.content}
        >
            {loading && <PendingMessage />}
            {status === 'FAILURE' && (
                <Message
                    className={styles.message}
                    icon={(
                        <Kraken
                            variant="experiment"
                            size="large"
                        />
                    )}
                    message="Oops! DEEP couldn't create the data necessary for visualization."
                />
            )}
            {(status === 'SUCCESS' || (status === 'PENDING' && isDefined(dataUrl))) && (
                <iframe
                    className={styles.iframe}
                    title="Visualization"
                    src={vizUrl}
                    sandbox="allow-scripts allow-same-origin allow-downloads"
                />
            )}
            {(status === 'PENDING' && isNotDefined(dataUrl)) && (
                <Message
                    className={styles.message}
                    icon={(
                        <Kraken
                            variant="experiment"
                            size="large"
                        />
                    )}
                    message="DEEP is currently processing your data. Please check again later."
                />
            )}
        </Container>
    );
}

export default AryDashboard;
