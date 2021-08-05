import React, { useCallback } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    Button,
    PendingMessage,
    Container,
} from '@the-deep/deep-ui';

import LeadPreview from '#newComponents/viewer/LeadPreview';

import { useRequest } from '#utils/request';
import _ts from '#ts';

import styles from './styles.scss';

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
        failureHeader: 'Export Preview',
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
            headingSize="extraSmall"
            heading="Preview"
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
            sub
            contentClassName={styles.mainContent}
        >
            {pending && <PendingMessage />}
            {isDefined(exportResponse) && !error && !pending && (
                <LeadPreview
                    url={exportResponse?.file}
                />
            )}
            {isNotDefined(exportResponse) && !pending && (
                <div className={styles.label}>
                    {isDefined(error)
                        ? error
                        : 'Select your desired export settings on the left and click the preview button to see the preview of your document.'
                    }
                </div>
            )}
        </Container>
    );
}

export default ExportPreview;
