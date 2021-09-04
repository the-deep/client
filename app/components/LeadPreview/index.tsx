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
} from '@the-deep/deep-ui';

import ExternalUrlPreview from './ExternalUrlPreview';
import Viewer from './Preview';
import { MimeTypes } from './Preview/mimeTypes';

import styles from './styles.css';

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
            <div className={_cs(styles.leadPreview, className)}>
                Preview not available
            </div>
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
                                to={url ?? attachment?.file ?? ''}
                            >
                                <IoOpenOutline />
                            </QuickActionLink>
                            <QuickActionButton
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
                        value={url}
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
            {attachment && (
                <Viewer
                    className={_cs(styles.content, className)}
                    url={attachment.file}
                    mimeType={attachment.mimeType}
                    canShowIframe
                />
            )}
        </div>
    );
}

export default LeadPreview;
