import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalFooter from '#rscv/Modal/Footer';
import ModalBody from '#rscv/Modal/Body';

import _ts from '#ts';

import ColorInput from '#rsci/ColorInput';
import SegmentInput from '#rsci/SegmentInput';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import styles from './styles.scss';

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

const penSizeOptions = [
    { key: 1, label: _ts('components.canvasDrawModal', 'penSizeOptionSmallLabel') },
    { key: 3, label: _ts('components.canvasDrawModal', 'penSizeOptionMediumLabel') },
    { key: 7, label: _ts('components.canvasDrawModal', 'penSizeOptionLargeLabel') },
];
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
        getComputedStyle(document.body).getPropertyValue('--color-accent'),
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

    return (
        <Modal className={styles.components.canvasDrawModal}>
            <ModalHeader title="Draw over the screenshot" />
            <ModalBody className={_cs(className, styles.canvasDraw)}>
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
                    <div className={styles.drawTools}>
                        <h4 className={styles.heading}>
                            Draw tools
                        </h4>
                        <div className={styles.content}>
                            <ColorInput
                                label={_ts('components.canvasDrawModal', 'penColorInputLabel')}
                                value={color}
                                onChange={handleColorInputChange}
                            />
                            <SegmentInput
                                label={_ts('components.canvasDrawModal', 'penSizeInputLabel')}
                                options={penSizeOptions}
                                value={penSize}
                                onChange={handlePenSizeInputChange}
                            />
                            <Button
                                onClick={handleClearButtonClick}
                                iconName="trash"
                            >
                                {_ts('components.canvasDrawModal', 'clearButtonLabel')}
                            </Button>
                        </div>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button
                    onClick={onCancel}
                >
                    {_ts('components.canvasDrawModal', 'cancelButtonLabel')}
                </Button>
                <PrimaryButton onClick={handleDoneButtonClick}>
                    {_ts('components.canvasDrawModal', 'doneButtonLabel')}
                </PrimaryButton>
            </ModalFooter>
        </Modal>
    );
}

export default CanvasDraw;
