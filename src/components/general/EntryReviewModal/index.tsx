import React, { useCallback, useRef, useState } from 'react';
import {
    _cs,
    isDefined,
    bound,
} from '@togglecorp/fujs';

import Pager from '#rscv/Pager';
import DangerButton from '#rsca/Button/DangerButton';
import Confirm from '#rscv/Modal/Confirm';
import FloatingContainer from '#rscv/FloatingContainer';
import ListView from '#rsu/../v2/View/ListView';

import useRequest from '#utils/request';
import { MultiResponse, EntryComment } from '#typings';
import { notifyOnFailure } from '#utils/requestNotify';
import _ts from '#ts';
import useDragMove from '#hooks/useDragMove';

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
    entryId: number;
    closeModal: () => void;
}

const WINDOW_PADDING = 24;

interface Comment {
    id: number;
    text: string;
}

const commentKeySelector = (d: EntryComment) => d.id;
const maxItemsPerPage = 50;

function EntryReviewModal(props: Props) {
    const {
        className,
        parentBCR,
        closeModal,
        entryId,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [
        commentsPending,
        commentsResponse,
    ] = useRequest<MultiResponse<EntryComment>>({
        url: `server://v2/entries/${entryId}/review-comments/`,
        method: 'GET',
        query: {
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        autoTrigger: true,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('entryReview', 'reviewHeading'))({ error: errorBody });
        },
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const [pristine, setPristine] = useState<boolean>(true);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    const handleInvalidate = useCallback((container) => {
        const { width, height, top, left } = container.getBoundingClientRect();

        const windowRect = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        let topCalc = top === 0 ? parentBCR.top : top;
        let leftCalc = left === 0 ? parentBCR.left - width : left;

        if (leftCalc < 0) {
            leftCalc = WINDOW_PADDING;
        }

        if ((topCalc + height) > (windowRect.height - WINDOW_PADDING)) {
            topCalc -= ((height + topCalc + WINDOW_PADDING) - windowRect.height);
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

    const commentRendererParams = useCallback((_, comment: EntryComment) => ({ comment }), []);

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
                        data={commentsResponse?.results}
                        keySelector={commentKeySelector}
                        rendererParams={commentRendererParams}
                        renderer={Comment}
                        pending={commentsPending}
                    />
                    {commentsResponse && commentsResponse?.count > 50 && (
                        <Pager
                            activePage={activePage}
                            itemsCount={commentsResponse?.count}
                            maxItemsPerPage={maxItemsPerPage}
                            onPageClick={setActivePage}
                            showItemsPerPageChange={false}
                        />
                    )}
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

