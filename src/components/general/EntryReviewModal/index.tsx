import React, { useCallback, useRef, useState } from 'react';
import {
    _cs,
    isDefined,
    bound,
} from '@togglecorp/fujs';

import DangerButton from '#rsca/Button/DangerButton';
import Confirm from '#rscv/Modal/Confirm';
import FloatingContainer from '#rscv/FloatingContainer';
import ListView from '#rscv/List/ListView';

import useDragMove from '#hooks/useDragMove';
import _ts from '#ts';

import Comment from './Comment';
import Review from './Review';
import styles from './styles.scss';

interface Position {
    top: number;
    left: number;
}

interface Props {
    className?: string;
    parentBCR: Position;
    closeModal: () => void;
}

const WINDOW_PADDING = 24;

interface Comment {
    id: number;
    text: string;
}
const commentKeySelector = (d: Comment) => d.id;
const comments: Comment[] = [
    {
        id: 1,
        text: 'Facilisis sed odio morbi quis commodo odio aenean sed adipiscing.',
    },
    {
        id: 2,
        text: 'Praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla!',
    },
    {
        id: 3,
        text: 'Sollicitudin tempor id eu nisl nunc mi ipsum, faucibus vitae.',
    },
    {
        id: 4,
        text: 'Facilisis sed odio morbi quis commodo odio aenean sed adipiscing.',
    },
    {
        id: 5,
        text: 'Ac ut consequat semper viverra nam libero justo, laoreet sit!',
    },
];

function EntryReviewModal(props: Props) {
    const {
        className,
        parentBCR,
        closeModal,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const [pristine, setPristine] = useState<boolean>(true);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    const handleInvalidate = useCallback((container) => {
        const { top, left } = parentBCR;

        const contentRect = container.getBoundingClientRect();

        const windowRect = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        let topCalc = top;
        let leftCalc = left - contentRect.width;

        if (leftCalc < 0) {
            leftCalc = WINDOW_PADDING;
        }

        if ((topCalc + contentRect.height) > (windowRect.height - WINDOW_PADDING)) {
            topCalc -= ((contentRect.height + topCalc + WINDOW_PADDING) - windowRect.height);
        }

        const optionsContainerPosition = {
            top: `${topCalc}px`,
            left: `${leftCalc}px`,
        };

        return optionsContainerPosition;
    }, [parentBCR]);

    const handleClose = useCallback(() => {
        if (!pristine) {
            setShowConfirm(true);
        } else if (isDefined(closeModal)) {
            closeModal();
        }
    }, [closeModal, pristine]);

    const handleCloseConfirmation = useCallback((confirmation) => {
        if (!confirmation) {
            setShowConfirm(true);
        } else if (isDefined(closeModal)) {
            closeModal();
        }
    }, [closeModal]);

    const commentRendererParams = useCallback((_, comment: Comment) => comment, []);

    const handleMouseMove = useCallback((e) => {
        if (containerRef.current) {
            const { width = 0, height = 0 } = containerRef.current.getBoundingClientRect();
            const maxX = window.innerWidth - width;
            const maxY = window.innerHeight - height;

            const getNumericPart = (d: string) => parseFloat(d.substr(0, d.length - 2));
            const left = getNumericPart(String(containerRef.current.style.left));
            const top = getNumericPart(String(containerRef.current.style.top));

            containerRef.current.style.left = `${bound(left + e.movementX, 0, maxX)}px`;
            containerRef.current.style.top = `${bound(top + e.movementY, 0, maxY)}px`;
        }
    }, []);

    const { handlePointerDown } = useDragMove({ onDragMove: handleMouseMove });
    return (
        <>
            <FloatingContainer
                elementRef={containerRef}
                className={_cs(className, styles.container)}
                onInvalidate={handleInvalidate}
                onClose={handleClose}
                focusTrap
                closeOnEscape
                showHaze
            >
                <div
                    role="presentation"
                    className={styles.header}
                    onPointerDown={handlePointerDown}
                >
                    <h3>
                        Entry Comments and Review
                    </h3>
                    <DangerButton
                        iconName="close"
                        onClick={handleClose}
                        transparent
                    />
                </div>
                <div className={styles.content}>
                    <Review
                        className={styles.review}
                        isAssigned={false}
                        isControlled={false}
                    />
                    <ListView
                        className={styles.comments}
                        data={comments}
                        keySelector={commentKeySelector}
                        rendererParams={commentRendererParams}
                        renderer={Comment}
                    />
                </div>
                <div className={styles.footer}>Approved By</div>
            </FloatingContainer>
            <Confirm
                className={styles.confirm}
                show={showConfirm}
                closeOnEscape={false}
                closeOnOutsideClick={false}
                onClose={handleCloseConfirmation}
            >
                {_ts('common', 'youHaveUnsavedChanges2')}
            </Confirm>
        </>
    );
}

export default EntryReviewModal;
