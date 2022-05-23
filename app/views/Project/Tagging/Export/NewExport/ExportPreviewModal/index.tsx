import React from 'react';
import { useQuery } from '@apollo/client';
import {
    Modal,
    PendingMessage,
    Message,
    Kraken,
} from '@the-deep/deep-ui';
import {
    ExportPreviewQuery,
    ExportPreviewQueryVariables,
} from '#generated/types';
import LeadPreview from '#components/lead/LeadPreview';

import { EXPORT_PREVIEW } from '../queries';

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

    return (
        <Modal
            size="cover"
            heading={exportPreviewData?.project?.export?.title}
            onCloseButtonClick={onCloseButtonClick}
        >
            {exportPreviewPending && <PendingMessage />}
            {exportPreviewData?.project?.export?.status === 'FAILURE' && (
                <Message
                    message="Failed to generate export preview"
                    icon={(
                        <Kraken
                            size="large"
                            variant="crutches"
                        />
                    )}
                />
            )}
            {exportPreviewData?.project?.export?.status === 'CANCELED' && (
                <Message
                    message="Export preview was canceled"
                    icon={(
                        <Kraken
                            size="large"
                            variant="crutches"
                        />
                    )}
                />
            )}
            {exportPreviewData?.project?.export?.status === 'SUCCESS' && (
                <LeadPreview
                    attachment={exportPreviewData?.project?.export}
                />
            )}
        </Modal>

    );
}

export default ExportPreviewModal;
