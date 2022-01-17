import React from 'react';
import {
    _cs,
    isValidUrl as isValidRemoteUrl,
} from '@togglecorp/fujs';
import {
    ImagePreview,
    Message,
    Kraken,
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

const rege = /(?<=\/\/)localhost(?=[:/]|$)/;

export function isLocalUrl(url: string) {
    return rege.test(url);
}

export function isValidUrl(url: string | undefined): url is string {
    if (!url) {
        return false;
    }
    const sanitizedUrl = url.replace(rege, 'localhost.com');
    return isValidRemoteUrl(sanitizedUrl);
}

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
        <Message
            className={_cs(styles.viewer, className)}
            message="Cannot preview https content."
            icon={(
                <Kraken
                    size="large"
                    variant="move"
                />
            )}
        />
    );

    // NOTE: Generally check for X-Frame-Options or CSP to identify if content
    // can be embedded
    const iframeError = (
        <Message
            className={_cs(styles.viewer, className)}
            message="This website has blocked us from viewing it inside DEEP."
            icon={(
                <Kraken
                    size="large"
                    variant="move"
                />
            )}
        />
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
        if (
            mimeType === 'application/pdf'
            && (
                (!cannotPreviewHttps && canShowIframe)
                || isLocalUrl(url)
            )
        ) {
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
        <Message
            className={_cs(styles.viewer, className)}
            message="We are unable to generate preview for this filetype."
            icon={(
                <Kraken
                    size="large"
                    variant="move"
                />
            )}
        />
    );
}

export default Preview;
