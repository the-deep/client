import PropTypes from 'prop-types';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import AccentButton from '#rsca/Button/AccentButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';

import notify from '#notify';
import _ts from '#ts';

import Screenshot from './Screenshot';
import Bar from './Bar';
import Preview from './Preview';

import styles from './styles.scss';

function GalleryViewer(props) {
    const {
        className: classNameFromProps,
        url,
        showUrl,
        showScreenshot,
        onScreenshotCapture,
        ...previewProps
    } = props;

    const [fullscreen, setFullscreen] = useState(false);
    const [screenshotMode, setScreenshotMode] = useState(false);
    const [currentScreenshot, setCurrentScreenshot] = useState(undefined);

    const viewerRef = useRef();

    useEffect(
        () => {
            const handleFullscreenChange = () => {
                setFullscreen(isDefined(document.fullscreenElement));
            };
            // NOTE: This is to add listener to whenever full screen mode is entered
            // and to change state of buttons after fullscreen mode is closed
            document.addEventListener('fullscreenchange', handleFullscreenChange);
            return () => {
                // NOTE: Remove attached listener after this component is dismounted
                document.removeEventListener('fullscreenchange', handleFullscreenChange);
            };
        },
        [],
    );

    const handleScreenshot = useCallback(
        (image) => {
            setCurrentScreenshot(image);
        },
        [],
    );

    const handleScreenshotStart = useCallback(
        () => {
            setScreenshotMode(true);
        },
        [],
    );

    const handleScreenshotClose = useCallback(
        () => {
            setScreenshotMode(false);
        },
        [],
    );

    const handleFullscreenClick = useCallback(
        () => {
            const { current: viewerContainer } = viewerRef;
            if (isNotDefined(viewerContainer)) {
                return;
            }
            if (!fullscreen && isDefined(viewerContainer.requestFullscreen)) {
                viewerContainer.requestFullscreen();
            } else if (fullscreen && isDefined(document.exitFullscreen)) {
                document.exitFullscreen();
            }
        },
        [fullscreen],
    );

    const handleScreenshotDone = useCallback(
        () => {
            setScreenshotMode(false);

            if (onScreenshotCapture) {
                onScreenshotCapture(currentScreenshot);
            }

            const { current: viewerContainer } = viewerRef;
            if (
                isDefined(document.fullscreenElement)
                && isDefined(viewerContainer)
                && isDefined(document.exitFullscreen)
            ) {
                document.exitFullscreen();
            }
        },
        [currentScreenshot, onScreenshotCapture],
    );

    const handleScreenshotError = useCallback(
        (message) => {
            notify.send({
                title: _ts('components.galleryViewer', 'errorTitle'), // screenshot
                type: notify.type.ERROR,
                message,
                duration: notify.duration.SLOW,
            });

            handleScreenshotClose();
        },
        [handleScreenshotClose],
    );

    const showBar = showUrl || showScreenshot;

    const className = _cs(
        styles.galleryViewer,
        showBar && styles.urlbarShown,
        classNameFromProps,
    );

    const docContainerClassName = _cs(
        styles.docContainer,
        'doc-container',
    );

    return (
        <div
            className={className}
            ref={viewerRef}
        >
            {showBar && (
                <Bar url={url}>
                    {showScreenshot && (
                        <>
                            {screenshotMode ? (
                                <AccentButton
                                    iconName="camera"
                                    onClick={handleScreenshotStart}
                                    transparent
                                    title={_ts('components.galleryViewer', 'screenshotButtonTitle')}
                                />
                            ) : (
                                <>
                                    {currentScreenshot && (
                                        <SuccessButton
                                            iconName="check"
                                            onClick={handleScreenshotDone}
                                            title={_ts('components.galleryViewer', 'saveButtonTitle')}
                                            transparent
                                        />
                                    )}
                                    <DangerButton
                                        iconName="close"
                                        onClick={handleScreenshotClose}
                                        title={_ts('components.galleryViewer', 'discardButtonTitle')} // discard screenshot
                                        transparent
                                    />
                                </>
                            )}
                        </>
                    )}
                    <AccentButton
                        transparent
                        iconName={fullscreen ? 'shrink' : 'expand'}
                        onClick={handleFullscreenClick}
                    />
                </Bar>
            )}
            <div className={docContainerClassName}>
                {screenshotMode && (
                    <Screenshot
                        onCapture={handleScreenshot}
                        onCaptureError={handleScreenshotError}
                        onCancel={handleScreenshotClose}
                    />
                )}
                <Preview
                    className={styles.doc}
                    url={url}
                    {...previewProps}
                />
            </div>
        </div>
    );
}
GalleryViewer.propTypes = {
    className: PropTypes.string,
    url: PropTypes.string,
    showUrl: PropTypes.bool,
    showScreenshot: PropTypes.bool,
    onScreenshotCapture: PropTypes.func,
};
GalleryViewer.defaultProps = {
    className: '',
    url: '',
    showUrl: false,
    showScreenshot: false,
    onScreenshotCapture: undefined,
};

export default GalleryViewer;
