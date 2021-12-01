import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoTrashBinOutline } from 'react-icons/io5';

import {
    Modal,
    ColorInput,
    Button,
    SegmentInput,
    Container,
} from '@the-deep/deep-ui';

import _ts from '#ts';

import styles from './styles.css';

interface Coordinate {
    x: number;
    y: number;
}

function useDraw(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    onDraw: (start: Coordinate, end: Coordinate) => void,
) {
    const mouseDownRef = React.useRef(false);
    const startRef = React.useRef<Coordinate>({ x: 0, y: 0 });
    const endRef = React.useRef<Coordinate>({ x: 0, y: 0 });

    const handleMouseDown = React.useCallback((e: MouseEvent) => {
        if (canvasRef.current) {
            mouseDownRef.current = true;
            const bcr = canvasRef.current.getBoundingClientRect();

            startRef.current = {
                x: e.clientX - bcr.left,
                y: e.clientY - bcr.top,
            };

            endRef.current = {
                ...startRef.current,
            };

            onDraw(startRef.current, endRef.current);
        }
    }, [canvasRef, onDraw]);

    const handleMouseUp = React.useCallback(() => {
        mouseDownRef.current = false;
    }, []);

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (mouseDownRef.current && canvasRef.current) {
            const bcr = canvasRef.current.getBoundingClientRect();

            endRef.current = {
                x: e.clientX - bcr.left,
                y: e.clientY - bcr.top,
            };

            onDraw(startRef.current, endRef.current);

            startRef.current = {
                ...endRef.current,
            };
        }
    }, [onDraw, canvasRef]);

    React.useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas) {
            canvas.addEventListener('mousedown', handleMouseDown);
            document.addEventListener('mouseup', handleMouseUp);
            canvas.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener('mousedown', handleMouseDown);
                document.removeEventListener('mouseup', handleMouseUp);
                canvas.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [handleMouseDown, handleMouseUp, handleMouseMove, canvasRef]);
}

interface PenSizeOption {
    key: number;
    label: string;
}
const penSizeOptions: PenSizeOption[] = [
    { key: 1, label: _ts('components.canvasDrawModal', 'penSizeOptionSmallLabel') },
    { key: 3, label: _ts('components.canvasDrawModal', 'penSizeOptionMediumLabel') },
    { key: 7, label: _ts('components.canvasDrawModal', 'penSizeOptionLargeLabel') },
];
const penSizeOptionKeySelector = (o: PenSizeOption) => o.key;
const penSizeOptionLabelSelector = (o: PenSizeOption) => o.label;
const DEFAULT_PEN_SIZE = penSizeOptions[1].key;

const drawImage = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    img: HTMLImageElement,
    scale: number,
) => {
    if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
            context.drawImage(
                img,
                0, 0, img.width * scale, img.height * scale,
            );
        }
    }
};

interface Props {
    className?: string;
    imgSrc?: string;
    onDone?: (imgData: string) => void;
    onCancel?: () => void;
}

function CanvasDraw(props: Props) {
    const {
        className,
        imgSrc,
        onDone,
        onCancel,
    } = props;

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = React.useRef<HTMLDivElement>(null);
    const [color, setColor] = React.useState(
        () => getComputedStyle(document.body).getPropertyValue('--color-accent'),
    );
    const [penSize, setPenSize] = React.useState(DEFAULT_PEN_SIZE);
    const colorRef = React.useRef(color);
    const penSizeRef = React.useRef(penSize);
    const imageDrawScaleRef = React.useRef(1);
    const imageRef = React.useRef<HTMLImageElement | null>(null);

    useDraw(canvasRef, (start, end) => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d');

            if (context) {
                context.beginPath();
                context.moveTo(start.x, start.y);
                context.lineTo(end.x, end.y);
                context.strokeStyle = colorRef.current;
                context.lineWidth = penSizeRef.current;
                context.stroke();
                context.closePath();
            }
        }
    });

    const handleColorInputChange = React.useCallback((newColor) => {
        colorRef.current = newColor;
        setColor(newColor);
    }, [setColor]);

    const handlePenSizeInputChange = React.useCallback((newPenSize) => {
        penSizeRef.current = newPenSize;
        setPenSize(newPenSize);
    }, [setPenSize]);

    const handleClearButtonClick = React.useCallback(() => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                if (imageRef.current) {
                    drawImage(canvasRef, imageRef.current, imageDrawScaleRef.current);
                }
            }
        }
    }, []);

    const handleDoneButtonClick = React.useCallback(() => {
        if (canvasRef.current && onDone) {
            onDone(canvasRef.current.toDataURL('image/jpeg'));
        }
    }, [onDone]);

    React.useEffect(() => {
        if (canvasRef.current && canvasContainerRef.current) {
            const canvas = canvasRef.current;
            const bcr = canvasContainerRef.current.getBoundingClientRect();

            if (imgSrc) {
                const img = new Image();
                img.addEventListener('load', () => {
                    const dx = (img.width - bcr.width) / img.width;
                    const dy = (img.height - bcr.height) / img.height;

                    if (dx > 0 || dy > 0) {
                        if (dx > dy) {
                            imageDrawScaleRef.current = bcr.width / img.width;
                        } else {
                            imageDrawScaleRef.current = bcr.height / img.height;
                        }

                        canvas.width = img.width * imageDrawScaleRef.current;
                        canvas.height = img.height * imageDrawScaleRef.current;
                    } else {
                        canvas.width = img.width;
                        canvas.height = img.height;
                    }

                    drawImage(canvasRef, img, imageDrawScaleRef.current);
                });
                img.src = imgSrc;
                imageRef.current = img;
            } else {
                canvas.width = bcr.width;
                canvas.height = bcr.height;
            }
        }
    }, [imgSrc]);

    const handleCloseButtonClick = React.useCallback(() => {
        if (onCancel) {
            onCancel();
        }
    }, [onCancel]);

    return (
        <Modal
            className={_cs(styles.canvasDrawModal, className)}
            heading={_ts('components.canvasDrawModal', 'modalHeading')}
            onCloseButtonClick={handleCloseButtonClick}
            size="large"
            footerActions={(
                <>
                    <Button
                        name="canvas-draw-cancel"
                        onClick={onCancel}
                        variant="secondary"
                    >
                        {_ts('components.canvasDrawModal', 'cancelButtonLabel')}
                    </Button>
                    <Button
                        name="canvas-draw-done"
                        variant="primary"
                        onClick={handleDoneButtonClick}
                    >
                        {_ts('components.canvasDrawModal', 'doneButtonLabel')}
                    </Button>
                </>
            )}
            bodyClassName={styles.canvasDraw}
        >
            <div
                ref={canvasContainerRef}
                className={styles.canvasContainer}
            >
                <canvas
                    ref={canvasRef}
                    className={styles.canvas}
                />
            </div>
            <div className={styles.toolbar}>
                <Container
                    heading={_ts('components.canvasDrawModal', 'drawToolsTitle')}
                    headingSize="small"
                    className={styles.drawTools}
                    contentClassName={styles.content}
                >
                    <ColorInput
                        name="pen-color"
                        // label={_ts('components.canvasDrawModal', 'penColorInputLabel')}
                        value={color}
                        onChange={handleColorInputChange}
                    />
                    <SegmentInput
                        name="pensize-options"
                        label={_ts('components.canvasDrawModal', 'penSizeInputLabel')}
                        options={penSizeOptions}
                        value={penSize}
                        onChange={handlePenSizeInputChange}
                        keySelector={penSizeOptionKeySelector}
                        labelSelector={penSizeOptionLabelSelector}
                    />
                    <Button
                        name="clear-canvas"
                        onClick={handleClearButtonClick}
                        variant="secondary"
                    >
                        <IoTrashBinOutline />
                    </Button>
                </Container>
            </div>
        </Modal>
    );
}

export default CanvasDraw;
