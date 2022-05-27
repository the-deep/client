import React from 'react';
import { useQuery } from '@apollo/client';
import {
    Modal,
    Message,
    Kraken,
} from '@the-deep/deep-ui';
import {
    ExportPreviewQuery,
    ExportPreviewQueryVariables,
} from '#generated/types';
import LeadPreview from '#components/lead/LeadPreview';

import { EXPORT_PREVIEW } from '../queries';

import styles from './styles.css';

interface Props {
    projectId: string;
    exportId: string;
    onCloseButtonClick: () => void;
}

function ExportPreviewModal(props: Props) {
    const {
        projectId,
        exportId,
        onCloseButtonClick,
    } = props;

    const {
        loading: exportPreviewPending,
        data: exportPreviewData,
        startPolling,
        stopPolling,
    } = useQuery<ExportPreviewQuery, ExportPreviewQueryVariables>(
        EXPORT_PREVIEW,
        {
            variables: {
                projectId,
                exportId,
            },
            onCompleted: (response) => {
                if (response?.project?.export?.status === 'PENDING' as const
                    || response?.project?.export?.status === 'STARTED' as const) {
                    startPolling(5000);
                } else {
                    stopPolling();
                }
            },
        },
    );

    const status = exportPreviewData?.project?.export?.status;

    return (
        <Modal
            size="large"
            heading={exportPreviewData?.project?.export?.title}
            onCloseButtonClick={onCloseButtonClick}
            bodyClassName={styles.body}
        >
            {status === 'SUCCESS' ? (
                <LeadPreview
                    className={styles.leadPreview}
                    attachment={exportPreviewData?.project?.export}
                />
            ) : (
                <Message
                    errored={status === 'FAILURE' || status === 'CANCELED'}
                    erroredEmptyMessage={status === 'CANCELED' ? 'Export preview was canceled' : 'Failed to generate export preview.'}
                    erroredEmptyIcon={(
                        <Kraken
                            size="large"
                            variant="crutches"
                        />
                    )}
                    pending={exportPreviewPending || status === 'PENDING' || status === 'STARTED'}
                    pendingMessage={status === 'STARTED' ? 'Export preview generation has started. Please wait...' : 'Export preview generation is pending. Please wait ...'}
                />
            )}
        </Modal>

    );
}

export default ExportPreviewModal;
