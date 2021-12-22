import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { brush as d3Brush } from 'd3-brush';
import { select } from 'd3-selection';
import { _cs } from '@togglecorp/fujs';

import { getScreenshot } from '#utils/browserExtension';
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

interface Props {
    className?: string;
    onCapture: (image: string | undefined) => void;
    onCaptureError: (errorComponent: React.ReactNode) => void;
    onCancel: () => void;
}

function Screenshot(props: Props) {
    const {
        className,
        onCapture,
        onCaptureError,
        onCancel,
    } = props;

    const firstResizeRef = React.useRef(true);
    const [imageProps, setImageProps] = React.useState<{
        image: HTMLImageElement | undefined;
        offsetX: number;
        offsetY: number;
        width: number;
        height: number
    }>({
        image: undefined,
        offsetX: 0,
        offsetY: 0,
        width: 0,
        height: 0,
    });

    const handleResize = React.useCallback((width = 0, height = 0) => {
        if (!firstResizeRef.current && width > 0 && height > 0 && onCancel) {
            onCancel();
        }

        firstResizeRef.current = false;
    }, [onCancel]);

    const brushContainerRef = React.useRef<SVGGElement>(null);
    const svgRef = React.useRef<SVGSVGElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const handleBrush = React.useCallback((event) => {
        if (!onCapture) {
            return;
        }

        const r = event.selection;
        if (!canvasRef.current || !imageProps.image || !r) {
            onCapture(undefined);
            return;
        }

        const croppedImage = getCroppedImage(
            canvasRef.current,
            imageProps.image,
            r[0][0],
            r[0][1],
            r[1][0],
            r[1][1],
        );
        onCapture(croppedImage);
    }, [onCapture, imageProps.image]);

    React.useEffect(() => {
        getScreenshot().then((result) => {
            if (svgRef.current) {
                const scale = window.devicePixelRatio;

                const rect = svgRef.current.getBoundingClientRect();
                const offsetX = rect.left * scale;
                const offsetY = rect.top * scale;
                const width = rect.width * scale;
                const height = rect.height * scale;

                const image = new Image();
                image.onload = () => {
                    setImageProps({
                        image,
                        offsetX,
                        offsetY,
                        width,
                        height,
                    });
                };

                image.src = result.image;
            }
        }).catch(() => {
            // FIXME: use strings
            const captureError = (
                <div className={styles.error}>
                    In order to use the screenshot functionality,
                    you must have the Chrome extension installed.
                    You can download it from the chrome web store
                    <a
                        className={styles.link}
                        href="https://chrome.google.com/webstore/detail/deep-2-add-lead/kafonkgglonkbldmcigbdojiadfcmcdc"
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
        });

        if (!svgRef.current || !brushContainerRef.current) {
            return undefined;
        }

        const scale = window.devicePixelRatio;
        const rect = svgRef.current.getBoundingClientRect();

        const container = select(brushContainerRef.current);
        const brushGroup = container.append('g').attr('class', 'brush');
        const brush = d3Brush()
            .extent([
                [rect.left * scale, rect.top * scale],
                [rect.right * scale, rect.bottom * scale],
            ])
            .on('end', handleBrush);
        brushGroup.call(brush);

        return () => {
            if (brushGroup) {
                brushGroup.remove();
            }
        };
    }, [handleBrush, onCaptureError]);

    const {
        image,
        offsetX,
        offsetY,
        width,
        height,
    } = imageProps;

    return (
        <div className={_cs(styles.screenshot, className)}>
            <svg
                ref={svgRef}
                viewBox={`${offsetX} ${offsetY} ${width} ${height}`}
            >
                {image && <image href={image.src} /> }
                <g ref={brushContainerRef} />
            </svg>
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
