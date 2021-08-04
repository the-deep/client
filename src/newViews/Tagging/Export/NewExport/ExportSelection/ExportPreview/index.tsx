import React, { useCallback, useState } from 'react';
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

import GalleryViewer from '#components/viewer/GalleryViewer';

import { useRequest } from '#utils/request';
import _ts from '#ts';

import styles from './styles.scss';

interface ExportObj {
    file?: string;
    mimeType?: string;
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

    const [error, setError] = useState<string | undefined>(undefined);
    const [exportObj, setExportObj] = useState<ExportObj | undefined>(undefined);

    const { pending } = useRequest<ExportObj>({
        skip: !exportId,
        url: exportId ? `server://exports/${exportId}/` : undefined,
        method: 'GET',
        shouldPoll: (response) => {
            const isPending = response?.pending;
            return isPending ? 2000 : -1;
        },
        onSuccess: (response) => {
            setExportObj(response);
        },
        onFailure: () => {
            setError(_ts('components.exportPreview', 'serverErrorText'));
        },
    });

    const handlePreviewClick = useCallback(() => {
        setError(undefined);
        setExportObj(undefined);
        if (onPreviewClick) {
            onPreviewClick();
        }
    }, [onPreviewClick]);

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
            {isDefined(exportObj) && !error && !pending && (
                <GalleryViewer
                    url={exportObj.file}
                    mimeType={exportObj.mimeType}
                    // NOTE: should not this be true
                    canShowIframe={false}
                    invalidUrlMessage={_ts('components.exportPreview', 'previewNotAvailableLabel')}
                    showUrl
                />
            )}
            {isNotDefined(exportObj) && !pending && (
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
