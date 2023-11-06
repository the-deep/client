import React, { useMemo, useState } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { IoShareSocialOutline } from 'react-icons/io5';
import {
    PendingMessage,
    Kraken,
    Message,
    Button,
    Container,
} from '@the-deep/deep-ui';
import { removeNull } from '@togglecorp/toggle-form';
import {
    prepareUrlParams,
} from '@togglecorp/toggle-request';
import {
    gql,
    useQuery,
} from '@apollo/client';

import ProjectContext from '#base/context/ProjectContext';
import { useModalState } from '#hooks/stateManagement';
import {
    ProjectVizQuery,
    ProjectVizQueryVariables,
} from '#generated/types';
import { entriesVizEndpoint } from '#base/configs/env';

import VisualizationShareModal from './VisualizationShareModal';

import styles from './styles.css';

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

function Dashboard(props: Props) {
    const {
        className,
    } = props;

    const { project } = React.useContext(ProjectContext);
    const activeProject = project?.id;
    const [publicUrl, setPublicUrl] = useState<string | undefined>();
    const [publicShareEnabled, setPublicShareEnabled] = useState<boolean | undefined>();

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
            onCompleted: (result) => {
                const cleanResult = removeNull(result);
                setPublicUrl(cleanResult?.project?.vizData?.publicUrl);
                setPublicShareEnabled(cleanResult?.project?.vizData?.publicShare);
            },
        },
    );

    const [
        isShareModalShown,
        showShareModal,
        hideShareModal,
    ] = useModalState(false);

    const status = data?.project?.vizData?.status;
    const dataUrl = data?.project?.vizData?.dataUrl;
    const publiclyShared = data?.project?.vizData?.publicShare;

    const vizUrl = useMemo(() => (
        `${entriesVizEndpoint}?${prepareUrlParams({ dataUrl: data?.project?.vizData?.dataUrl })}`
    ), [data]);

    return (
        <Container
            className={_cs(styles.dashboard, className)}
            headerClassName={styles.header}
            headerActions={(
                ((publicUrl && publiclyShared) || project?.allowedPermissions.includes('UPDATE_PROJECT'))
                && project?.isVisualizationAvailable
                && project?.isVisualizationEnabled
            ) && (
                <Button
                    name={undefined}
                    icons={(<IoShareSocialOutline />)}
                    onClick={showShareModal}
                >
                    Share
                </Button>
            )}
            contentClassName={styles.content}
        >
            {loading && <PendingMessage />}
            {!project?.isVisualizationAvailable && (
                <Message
                    className={styles.message}
                    icon={(
                        <Kraken
                            variant="crutches"
                            size="large"
                        />
                    )}
                    message="Looks like the analytical framework is not configured properly for dashboards to be visible for this project."
                />
            )}
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
                    message="DEEP is currently processing your data. Please check again later."
                    icon={(
                        <Kraken
                            variant="experiment"
                            size="large"
                        />
                    )}
                />
            )}
            {isShareModalShown && activeProject && (
                <VisualizationShareModal
                    url={publicUrl}
                    projectId={activeProject}
                    publicShareEnabled={publicShareEnabled}
                    onPublicShareEnabledChange={setPublicShareEnabled}
                    onPublicUrlChange={setPublicUrl}
                    onClose={hideShareModal}
                    isAdmin={!!project?.allowedPermissions.includes('UPDATE_PROJECT')}
                />
            )}
        </Container>
    );
}

export default Dashboard;
