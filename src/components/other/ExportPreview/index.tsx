import React, { useCallback, useState } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import PrimaryButton from '#rsca/Button/PrimaryButton';

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
        <div className={_cs(className, styles.exportPreview)}>
            <header className={styles.header}>
                <h2 className={styles.heading}>
                    {_ts('components.exportPreview', 'previewHeading')}
                </h2>
                {isDefined(onPreviewClick) && (
                    <PrimaryButton
                        className={styles.button}
                        onClick={handlePreviewClick}
                        pending={pending}
                    >
                        {_ts('export', 'showPreviewButtonLabel')}
                    </PrimaryButton>
                )}
            </header>
            <div className={styles.mainContent}>
                {pending && <LoadingAnimation />}
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
                    <Message>
                        {isDefined(error)
                            ? error
                            : _ts('components.exportPreview', 'previewNotAvailableLabel')
                        }
                    </Message>
                )}
            </div>
        </div>
    );
}

export default ExportPreview;
