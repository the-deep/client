import React, { useCallback, useState } from 'react';
import {
    _cs,
    isValidUrl as isValidRemoteUrl,
} from '@togglecorp/fujs';
import {
    ImagePreview,
    Message,
    Kraken,
    Button,
} from '@the-deep/deep-ui';

import { useRequest, useLazyRequest } from '#base/utils/restRequest';
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

    const [cached, setCached] = useState(false);

    const {
        pending,
        response,
    } = useRequest<{ status: string, url: string | undefined }>({
        url: 'pdf-cache://cache/',
        method: 'GET',
        skip: !cached,
        query: { url },
        shouldPoll: (res) => (res?.status === 'pending' ? 3000 : -1),
    });

    const {
        pending: pendingCache,
        trigger,
    } = useLazyRequest<unknown, string>({
        url: 'pdf-cache://cache/',
        method: 'POST',
        body: (ctx) => ({ url: ctx }),
        onSuccess: () => {
            setCached(true);
        },
        failureMessage: 'Failed to capture page snapshot.',
    });

    const handleGetStatus = useCallback(
        () => {
            trigger(url);
        },
        [trigger, url],
    );

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

    let iframeError: JSX.Element;
    if (cached) {
        if (pending || (response?.status === 'pending')) {
            iframeError = (
                <Message
                    className={_cs(styles.viewer, className)}
                    pending
                    pendingMessage="DEEP trying to generate page snapshot!"
                />
            );
        } else if (response && response.url && response.status === 'processed') {
            iframeError = (
                <iframe
                    title={url}
                    className={_cs(className, styles.viewer)}
                    src={!response.url.startsWith('http://') && !response.url.startsWith('https://') ? `http://${response.url}` : response.url}
                />
            );
        } else {
            iframeError = (
                <Message
                    className={_cs(styles.viewer, className)}
                    message="DEEP failed to generate page snapshot!"
                    icon={(
                        <Kraken
                            size="large"
                            variant="move"
                        />
                    )}
                />
            );
        }
    } else {
        iframeError = (
            <Message
                className={_cs(styles.viewer, className)}
                message="The website has blocked us from viewing it inside DEEP. While we work on a long-term solution, click below to download a copy of the page to DEEP (this can take a minute or two)."
                icon={(
                    <Kraken
                        size="large"
                        variant="move"
                    />
                )}
                actions={(
                    <Button
                        name={undefined}
                        onClick={handleGetStatus}
                        disabled={pending || pendingCache}
                    >
                        Show Page Snapshot
                    </Button>
                )}
            />
        );
    }

    // NOTE: Generally check for X-Frame-Options or CSP to identify if content
    // can be embedded
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
