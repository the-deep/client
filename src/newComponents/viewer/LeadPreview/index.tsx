import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ExternalUrlPreview from './ExternalUrlPreview';
import Viewer from './Preview';
import { MimeTypes } from './Preview/mimeTypes';

import styles from './styles.scss';

export interface Attachment {
    id: number;
    title: string;
    file: string;
    mimeType: MimeTypes;
}

interface Props {
    className?: string;
    url?: string;
    attachment?: Attachment;
}

function LeadPreview(props: Props) {
    const {
        url,
        attachment,
        className,
    } = props;

    if (url) {
        return (
            <ExternalUrlPreview
                className={_cs(styles.leadPreview, className)}
                url={url}
            />
        );
    }

    if (attachment) {
        const {
            file,
            mimeType,
        } = attachment;
        return (
            <Viewer
                className={_cs(styles.leadPreview, className)}
                url={file}
                mimeType={mimeType}
                canShowIframe
            />
        );
    }

    return (
        <div className={_cs(styles.leadPreview, className)}>
            Preview not available
        </div>
    );
}

export default LeadPreview;
