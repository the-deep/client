import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    _cs,
    isNotDefined,
    isDefined,
    isValidUrl,
} from '@togglecorp/fujs';
import {
    AiOutlineShrink,
    AiOutlineExpandAlt,
} from 'react-icons/ai';
import {
    IoOpenOutline,
} from 'react-icons/io5';
import {
    QuickActionButton,
    QuickActionLink,
    TextInput,
    ImagePreview,
} from '@the-deep/deep-ui';

import {
    MimeTypes,
    isImageMimeType,
    isDocMimeType,
    isHTMLMimeType,
    createUrlForGoogleViewer,
} from './mimeTypes';

import styles from './styles.scss';

function isHttps(text?: string) {
    if (!text) {
        return false;
    }
    return text.startsWith('https:');
}

interface FinalIframeProps {
    className?: string;
    url: string;
    mimeType: MimeTypes;
    canShowIframe: boolean;
}

function FinalIframe(props: FinalIframeProps) {
    const {
        className,
        url,
        mimeType,
        canShowIframe,
    } = props;

    const isRunningInHTTP = window.location.protocol === 'http:';
    const isCurrentUrlHTTPs = isHttps(url);

    // NOTE: We are checking if current URL is https or the system is running in
    // http mode because http url shouldn't be embedded under http env
    if (isImageMimeType(mimeType) && (isCurrentUrlHTTPs || isRunningInHTTP)) {
        return (
            <ImagePreview
                alt=""
                src={url}
                className={className}
            />
        );
    } else if (isDocMimeType(mimeType)) {
        // FIXME: We need to confirm this logic
        const useGoogle = mimeType !== 'application/pdf'
            || !(isCurrentUrlHTTPs || isRunningInHTTP)
            || !canShowIframe;

        const src = useGoogle
            ? createUrlForGoogleViewer(url)
            : url;
        const sandbox = useGoogle
            ? 'allow-scripts allow-same-origin allow-popups'
            : undefined;

        return (
            <iframe
                title={url}
                src={src}
                className={className}
                sandbox={sandbox}
            />
        );
    } else if (
        (isHTMLMimeType(mimeType) || url.endsWith('txt'))
        && canShowIframe
        && (isCurrentUrlHTTPs || isRunningInHTTP)
    ) {
        // NOTE: Error can occur if
        // 1. We cannot show iframe
        // 2. If there is no alternative https url and current url is http
        return (
            <iframe
                sandbox="allow-scripts allow-same-origin"
                title={url}
                className={className}
                src={url}
            />
        );
    }

    return (
        <div className={className}>
            {isValidUrl(url)
                ? 'Failed to preview current URL.'
                : 'The entered url is not valud.'
            }
        </div>
    );
}

interface Props {
    url: string;
    className?: string;
    hideBar?: boolean;
    mimeType: MimeTypes;
    canShowIframe: boolean;
}

function Preview(props: Props) {
    const {
        url,
        className,
        hideBar,
        mimeType,
        canShowIframe,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    const [fullScreenMode, setFullScreenMode] = useState(false);

    const handleFullScreenChange = useCallback(() => {
        setFullScreenMode(isDefined(document.fullscreenElement));
    }, []);

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return (() => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        });
    }, [handleFullScreenChange]);

    const handleFullScreenToggleClick = useCallback(() => {
        if (isNotDefined(containerRef.current)) {
            return;
        }
        const { current: viewerContainer } = containerRef;
        if (!fullScreenMode && isDefined(viewerContainer?.requestFullscreen)) {
            viewerContainer?.requestFullscreen();
        } else if (fullScreenMode && isDefined(document.exitFullscreen)) {
            document.exitFullscreen();
        }
    }, [fullScreenMode]);

    return (
        <div
            className={_cs(className, styles.viewer)}
            ref={containerRef}
        >
            {!hideBar && (
                <div className={styles.bar}>
                    <TextInput
                        className={styles.url}
                        name="url"
                        value={url}
                        variant="general"
                        readOnly
                    />
                    <QuickActionLink
                        className={styles.link}
                        to={url}
                    >
                        <IoOpenOutline />
                    </QuickActionLink>
                    <QuickActionButton
                        className={styles.button}
                        name={undefined}
                        onClick={handleFullScreenToggleClick}
                    >
                        {fullScreenMode ? <AiOutlineShrink /> : <AiOutlineExpandAlt />}
                    </QuickActionButton>
                </div>
            )}
            <FinalIframe
                canShowIframe={canShowIframe}
                url={url}
                mimeType={mimeType}
                className={styles.content}
            />
        </div>
    );
}

export default Preview;
