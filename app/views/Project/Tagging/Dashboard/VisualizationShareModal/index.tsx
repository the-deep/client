import React, { useCallback } from 'react';
import {
    IoHelpCircleOutline,
    IoCopy,
    IoReloadOutline,
} from 'react-icons/io5';
import {
    Modal,
    useAlert,
    QuickActionButton,
    TextInput,
    Checkbox,
    Button,
} from '@the-deep/deep-ui';
import { removeNull } from '@togglecorp/toggle-form';
import {
    gql,
    useMutation,
} from '@apollo/client';

import {
    ProjectVizConfigurationUpdateMutation,
    ProjectVizConfigurationUpdateMutationVariables,
} from '#generated/types';
import _ts from '#ts';

import styles from './styles.css';

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

function VisualizationShareModal(props: ShareModalProps) {
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
                } else {
                    alert.show(
                        'Failed to change url status.',
                        {
                            variant: 'error',
                        },
                    );
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
            freeHeight
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
                        actions={(
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

export default VisualizationShareModal;
