import React, { useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    Button,
    PendingMessage,
    Container,
} from '@the-deep/deep-ui';

import LeadPreview from '#components/lead/LeadPreview';

import { useRequest } from '#base/utils/restRequest';
import _ts from '#ts';

import styles from './styles.css';

interface ExportObj {
    file?: string;
    pending?: boolean;
}

interface OwnProps {
    className?: string;
    exportId?: number | string;
    onPreviewClick?: () => void;
}

function ExportPreview(props: OwnProps) {
    const {
        className,
        exportId,
        onPreviewClick,
    } = props;

    const {
        pending,
        response: exportResponse,
        error,
        retrigger,
    } = useRequest<ExportObj>({
        skip: !exportId,
        url: exportId ? `server://exports/${exportId}/` : undefined,
        method: 'GET',
        shouldPoll: (response) => {
            const isPending = response?.pending;
            return isPending ? 2000 : -1;
        },
        failureMessage: 'Failed to preview export.',
    });

    const handlePreviewClick = useCallback(() => {
        retrigger();
        if (onPreviewClick) {
            onPreviewClick();
        }
    }, [onPreviewClick, retrigger]);

    return (
        <Container
            className={_cs(className, styles.exportPreview)}
            headingSize="small"
            heading="Preview"
            spacing="none"
            headerClassName={styles.header}
            headingClassName={styles.heading}
            headerActions={isDefined(onPreviewClick) && (
                <Button
                    name="showPreview"
                    variant="primary"
                    onClick={handlePreviewClick}
                    disabled={pending}
                >
                    {_ts('export', 'showPreviewButtonLabel')}
                </Button>
            )}
            contentClassName={styles.mainContent}
        >
            {pending && <PendingMessage />}
            {!pending && isDefined(exportResponse) ? (
                <LeadPreview
                    className={styles.leadPreview}
                    url={exportResponse.file}
                />
            ) : (!pending && (
                <div className={styles.label}>
                    {
                        error ?? 'Select your desired export settings on the left and click the preview button to see the preview of your document.'
                    }
                </div>
            ))}
        </Container>
    );
}

export default ExportPreview;
