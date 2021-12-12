import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    IoOpenOutline,
    IoExpand,
} from 'react-icons/io5';
import {
    Element,
    QuickActionButton,
    QuickActionLink,
    TextInput,
    Message,
    Kraken,
} from '@the-deep/deep-ui';

import ExternalUrlPreview from './ExternalUrlPreview';
import Viewer from './Preview';
import { MimeTypes } from './Preview/mimeTypes';

import styles from './styles.css';

export interface Attachment {
    id: string;
    title: string | undefined;
    file?: {
        url?: string | undefined | null;
    } | undefined | null;
    mimeType?: MimeTypes | undefined | null;
}

interface Props {
    className?: string;
    url?: string;
    attachment?: Attachment | null;
    hideBar?: boolean;
}

function LeadPreview(props: Props) {
    const {
        url,
        attachment,
        className,
        hideBar,
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

    if (!url && !attachment) {
        return (
            <Message
                className={_cs(styles.leadPreview, className)}
                message="We couldn't find anything to preview."
                icon={(
                    <Kraken
                        size="large"
                        variant="hi"
                    />
                )}
            />
        );
    }

    return (
        <div
            className={_cs(className, styles.leadPreview)}
            ref={containerRef}
        >
            {!hideBar && (
                <Element
                    className={styles.bar}
                    actions={(
                        <>
                            <QuickActionLink
                                className={styles.link}
                                to={url || attachment?.file?.url || ''}
                            >
                                <IoOpenOutline />
                            </QuickActionLink>
                            <QuickActionButton
                                title={fullScreenMode ? 'Exit fullscreen' : 'Enter fullscreen'}
                                className={styles.button}
                                name={undefined}
                                onClick={handleFullScreenToggleClick}
                            >
                                <IoExpand />
                            </QuickActionButton>
                        </>
                    )}
                >
                    <TextInput
                        className={styles.url}
                        name="url"
                        value={url || attachment?.file?.url}
                        variant="general"
                        readOnly
                    />
                </Element>
            )}
            {url && (
                <ExternalUrlPreview
                    className={_cs(styles.content, className)}
                    url={url}
                />
            )}
            {attachment?.file?.url && attachment.mimeType && (
                <Viewer
                    className={_cs(styles.content, className)}
                    url={attachment.file.url}
                    mimeType={attachment.mimeType}
                    canShowIframe
                />
            )}
        </div>
    );
}

export default LeadPreview;
