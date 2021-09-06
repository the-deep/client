import React from 'react';
import {
    _cs,
    isValidUrl,
} from '@togglecorp/fujs';
import {
    ImagePreview,
} from '@the-deep/deep-ui';

import { isHttps } from '#utils/common';

import {
    MimeTypes,
    isImageMimeType,
    isDocMimeType,
    isHTMLMimeType,
    createUrlForGoogleViewer,
} from './mimeTypes';

import styles from './styles.css';

interface Props {
    className?: string;
    url: string;
    mimeType: MimeTypes;
    canShowIframe: boolean;
}

function Preview(props: Props) {
    const {
        className,
        url,
        mimeType,
        canShowIframe,
    } = props;

    if (!isValidUrl(url)) {
        return (
            <div className={_cs(styles.viewer, className)}>
                The url is invalid.
            </div>
        );
    }

    const isRunningInHTTP = window.location.protocol === 'http:';
    const isCurrentUrlHTTPS = isHttps(url);

    const cannotPreviewHttps = !isCurrentUrlHTTPS && !isRunningInHTTP;

    // NOTE: When hosted in http, we cannot use iframe or image to preview
    const httpsError = (
        <div className={_cs(styles.viewer, className)}>
            Cannot preview https content.
        </div>
    );

    // NOTE: Generally check for X-Frame-Options or CSP to identify if content
    // can be embedded
    const iframeError = (
        <div className={_cs(styles.viewer, className)}>
            Cannot preview in iframe.
        </div>
    );

    if (url.endsWith('txt')) {
        if (cannotPreviewHttps) {
            return httpsError;
        }
        if (!canShowIframe) {
            return iframeError;
        }
        return (
            <iframe
                sandbox="allow-scripts allow-same-origin"
                title={url}
                className={_cs(className, styles.viewer)}
                src={url}
            />
        );
    }
    if (isImageMimeType(mimeType)) {
        if (cannotPreviewHttps) {
            return httpsError;
        }
        return (
            <ImagePreview
                alt=""
                src={url}
                className={className}
            />
        );
    }
    if (isDocMimeType(mimeType)) {
        // NOTE: try to show pdf in iframe
        if (mimeType === 'application/pdf' && !cannotPreviewHttps && canShowIframe) {
            return (
                <iframe
                    title={url}
                    src={url}
                    className={_cs(className, styles.viewer)}
                />
            );
        }

        return (
            <iframe
                title={url}
                src={createUrlForGoogleViewer(url)}
                className={_cs(className, styles.viewer)}
                sandbox="allow-scripts allow-same-origin allow-popups"
            />
        );
    }
    if (isHTMLMimeType(mimeType)) {
        if (cannotPreviewHttps) {
            return httpsError;
        }
        if (!canShowIframe) {
            return iframeError;
        }
        return (
            <iframe
                sandbox="allow-scripts allow-same-origin"
                title={url}
                className={_cs(className, styles.viewer)}
                src={url}
            />
        );
    }
    return (
        <div className={_cs(styles.viewer, className)}>
            Cannot preview for this filetype.
        </div>
    );
}

export default Preview;
