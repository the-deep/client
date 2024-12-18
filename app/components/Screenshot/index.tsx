import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { brush as d3Brush } from 'd3-brush';
import { select } from 'd3-selection';
import { _cs } from '@togglecorp/fujs';

import { extensionChromeUrl } from '#base/configs/env';

import { getScreenshot as getScreenshotFromExtension } from '#utils/browserExtension';

import styles from './styles.css';

function getCroppedImage(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
) {
    if (!canvas || !image) {
        return undefined;
    }

    /* eslint-disable no-param-reassign */
    canvas.width = endX - startX;
    canvas.height = endY - startY;
    /* eslint-enable no-param-reassign */

    const context = canvas.getContext('2d');
    if (!context) {
        return undefined;
    }

    context.drawImage(
        image,
        startX,
        startY,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height,
    );

    const croppedImage = canvas.toDataURL('image/jpeg');

    /* eslint-disable no-param-reassign */
    canvas.width = 0;
    canvas.height = 0;
    /* eslint-enable no-param-reassign */

    return croppedImage;
}

async function getImageFromUrl(imgUrl: string) {
    const promise = new Promise<HTMLImageElement>((resolve) => {
        const image = new Image();
        image.onload = () => {
            resolve(image);
        };
        image.src = imgUrl;
    });

    return promise;
}

interface Props {
    className?: string;
    onCapture: (image: string | undefined) => void;
    onCaptureError: (errorComponent: React.ReactNode) => void;
    onCancel: () => void;
}

interface Rect {
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
}

function Screenshot(props: Props) {
    const {
        className,
        onCapture,
        onCaptureError,
        onCancel,
    } = props;

    const firstResizeRef = React.useRef(true);
    const brushContainerRef = React.useRef<SVGGElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const [screenshotImage, setScreenshotImage] = React.useState<HTMLImageElement | null>(null);
    const [containerRect, setContainerRect] = React.useState<Rect>({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: 0,
        height: 0,
    });

    const handleResize = React.useCallback((width = 0, height = 0) => {
        if (!firstResizeRef.current && width > 0 && height > 0 && onCancel) {
            onCancel();
        }

        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            const scale = window.devicePixelRatio;

            setContainerRect({
                top: Math.round(rect.top * scale),
                right: Math.round(rect.right * scale),
                bottom: Math.round(rect.bottom * scale),
                left: Math.round(rect.left * scale),
                width: Math.round(rect.width * scale),
                height: Math.round(rect.height * scale),
            });
        }

        firstResizeRef.current = false;
    }, [onCancel]);

    const handleBrush = React.useCallback((event: { selection: number[][] }) => {
        if (!onCapture) {
            return;
        }

        const r = event.selection;
        if (!canvasRef.current || !screenshotImage || !r) {
            onCapture(undefined);
            return;
        }

        const croppedImage = getCroppedImage(
            canvasRef.current,
            screenshotImage,
            r[0][0],
            r[0][1],
            r[1][0],
            r[1][1],
        );
        onCapture(croppedImage);
    }, [onCapture, screenshotImage]);

    React.useEffect(() => {
        async function getScreenshot() {
            try {
                const screenshotResult = await getScreenshotFromExtension();
                const image = await getImageFromUrl(screenshotResult.image);
                setScreenshotImage(image);
            } catch {
                // FIXME: use strings
                const captureError = (
                    <div className={styles.error}>
                        In order to use the screenshot functionality,
                        you must have the Chrome extension installed.
                        You can download it from the chrome web store
                        <a
                            className={styles.link}
                            // NOTE: the `deep` username is hardcoded here
                            href={extensionChromeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            here.
                        </a>
                    </div>
                );
                if (onCaptureError) {
                    onCaptureError(captureError);
                }
            }
        }

        getScreenshot();
    }, [onCaptureError]);

    React.useEffect(() => {
        if (!brushContainerRef.current || !containerRect || !screenshotImage) {
            return undefined;
        }

        const container = select(brushContainerRef.current);
        const brushGroup = container.append('g').attr('class', 'brush');
        const brush = d3Brush()
            .extent([
                [containerRect.left, containerRect.top],
                [containerRect.right, containerRect.bottom],
            ])
            .on('end', handleBrush);
        brushGroup.call(brush);

        return () => {
            if (brushGroup) {
                brushGroup.remove();
            }
        };
    }, [containerRect, handleBrush, onCaptureError, screenshotImage]);

    return (
        <div
            className={_cs(styles.screenshot, className)}
            ref={containerRef}
        >
            {containerRect.width && containerRect.height && (
                <svg
                    viewBox={`${containerRect.left} ${containerRect.top} ${containerRect.width} ${containerRect.height}`}
                >
                    {screenshotImage && <image href={screenshotImage.src} /> }
                    <g ref={brushContainerRef} />
                </svg>
            )}
            <canvas
                ref={canvasRef}
                width={0}
                height={0}
            />
            <ReactResizeDetector
                onResize={handleResize}
                handleWidth
                handleHeight
            />
        </div>
    );
}

export default Screenshot;
