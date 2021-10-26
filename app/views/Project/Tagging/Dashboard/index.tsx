import React, { useCallback, useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoHelpCircleOutline,
    IoShareSocialOutline,
    IoCopy,
    IoReloadOutline,
} from 'react-icons/io5';
import {
    Modal,
    useAlert,
    PendingMessage,
    QuickActionButton,
    TextInput,
    Checkbox,
    Message,
    Button,
    Container,
} from '@the-deep/deep-ui';
import {
    prepareUrlParams,
} from '@togglecorp/toggle-request';
import { removeNull } from '@togglecorp/toggle-form';
import {
    useQuery,
    gql,
    useMutation,
} from '@apollo/client';

import ProjectContext from '#base/context/ProjectContext';
import { useModalState } from '#hooks/stateManagement';
import {
    ProjectVizQuery,
    ProjectVizQueryVariables,
    ProjectVizConfigurationUpdateMutation,
    ProjectVizConfigurationUpdateMutationVariables,
} from '#generated/types';
import _ts from '#ts';

import styles from './styles.css';

const vizRendererUrl = process.env.REACT_APP_ENTRY_VIZ_URL || 'https://the-deep.github.io/deepviz-entries/';

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

const UPDATE_PROJECT_VIZ_PUBLIC_SHARE = gql`
mutation ProjectVizConfigurationUpdate($projectId: ID!, $action: ProjectStatsActionEnum!) {
    project(id: $projectId) {
        projectVizConfigurationUpdate(data: { action: $action }) {
            ok
            result {
                dataUrl
                publicUrl
                publicShare
                status
            }
        }
    }
}
`;

interface ShareModalProps {
    url: string | undefined;
    publicShareEnabled: boolean | undefined;
    onClose: () => void;
    projectId: string;
    onPublicShareEnabledChange: (publicShareEnabled: boolean) => void;
    onPublicUrlChange: (publicUrl: string | undefined) => void;
    isAdmin: boolean;
}

function ShareModal(props: ShareModalProps) {
    const {
        url,
        onClose,
        publicShareEnabled,
        onPublicShareEnabledChange,
        onPublicUrlChange,
        projectId,
        isAdmin,
    } = props;

    const alert = useAlert();

    const [
        updateProjectVizPublicUrlShare,
    ] = useMutation<
    ProjectVizConfigurationUpdateMutation,
    ProjectVizConfigurationUpdateMutationVariables
    >(
        UPDATE_PROJECT_VIZ_PUBLIC_SHARE,
        {
            onCompleted: (response) => {
                const update = removeNull(response?.project?.projectVizConfigurationUpdate);
                if (update?.ok) {
                    alert.show(
                        'Successfully changed url status.',
                        {
                            variant: 'success',
                        },
                    );
                    onPublicShareEnabledChange(!!update?.result?.publicShare);
                    onPublicUrlChange(update?.result?.publicUrl);
                }
            },
            onError: (gqlError) => {
                alert.show(
                    gqlError.message,
                    { variant: 'error' },
                );
            },
        },
    );

    const handleCheckboxClick = useCallback(() => {
        updateProjectVizPublicUrlShare({
            variables: {
                projectId,
                action: publicShareEnabled ? 'OFF' : 'ON',
            },
        });
    }, [projectId, publicShareEnabled, updateProjectVizPublicUrlShare]);

    const handleResetClick = useCallback(() => {
        updateProjectVizPublicUrlShare({
            variables: {
                projectId,
                action: 'NEW',
            },
        });
    }, [projectId, updateProjectVizPublicUrlShare]);

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(url ?? '');

        alert.show(
            'Url was successfully copied to the clipboard',
            {
                variant: 'info',
            },
        );
    }, [url, alert]);

    return (
        <Modal
            className={styles.modal}
            heading="Share Public Link"
            bodyClassName={styles.modalBody}
            onCloseButtonClick={onClose}
        >
            <Checkbox
                name="isShared"
                label="Enable Public Link"
                value={publicShareEnabled}
                onChange={handleCheckboxClick}
                disabled={isAdmin}
            />
            {publicShareEnabled && url && (
                <>
                    <TextInput
                        name="url"
                        value={url}
                        readOnly
                        actions={url && (
                            <QuickActionButton
                                name="copy"
                                variant="secondary"
                                title="copy"
                                onClick={copyToClipboard}
                            >
                                <IoCopy />
                            </QuickActionButton>
                        )}
                    />
                    {isAdmin && (
                        <Button
                            name="reset"
                            onClick={handleResetClick}
                            variant="secondary"
                            icons={(
                                <IoReloadOutline />
                            )}
                        >
                            Reset Public URL
                        </Button>
                    )}
                </>
            )}
            <p>
                <IoHelpCircleOutline />
                {_ts('entries', 'entriesPublicLinkHelpText')}
            </p>
        </Modal>
    );
}

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
                if (result?.project?.vizData?.publicUrl) {
                    setPublicUrl(result?.project?.vizData?.publicUrl);
                }
                setPublicShareEnabled(result?.project?.vizData?.publicShare);
            },
        },
    );

    const [
        isShareModalShown,
        showShareModal,
        hideShareModal,
    ] = useModalState(false);

    const vizUrl = useMemo(() => (
        `${vizRendererUrl}?${prepareUrlParams({ dataUrl: data?.project?.vizData?.dataUrl })}`
    ), [data]);

    const status = data?.project?.vizData?.status;

    return (
        <Container
            className={_cs(styles.dashboard, className)}
            headerClassName={styles.header}
            headerActions={(publicUrl || project?.allowedPermissions.includes('UPDATE_PROJECT')) && (
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
            {status === 'FAILURE' && (
                <Message
                    className={styles.message}
                    message="Oops! DEEP couldn't create the data necessary for visualization."
                />
            )}
            {status === 'SUCCESS' && (
                <iframe
                    className={styles.iframe}
                    title="Visualization"
                    src={vizUrl}
                    sandbox="allow-scripts allow-same-origin allow-downloads"
                />
            )}
            {status === 'PENDING' && (
                <Message
                    className={styles.message}
                    message="DEEP is currently processing your data. Please check again later."
                />
            )}
            {isShareModalShown && activeProject && publicUrl && (
                <ShareModal
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
