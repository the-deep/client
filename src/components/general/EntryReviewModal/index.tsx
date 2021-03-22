import React, { useCallback, useRef, useState } from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    isDefined,
    bound,
} from '@togglecorp/fujs';

import Pager from '#rscv/Pager';
import DangerButton from '#rsca/Button/DangerButton';
import Confirm from '#rscv/Modal/Confirm';
import FloatingContainer from '#rscv/FloatingContainer';
import LoadingAnimation from '#rscv/LoadingAnimation';
import List from '#rsu/../v2/View/List';
import CommaSeparateItems from '#components/viewer/CommaSeparateItems';

import useRequest from '#utils/request';
import { MultiResponse, EntryComment, EntryReviewSummary, AppState } from '#typings';
import { notifyOnFailure } from '#utils/requestNotify';
import _ts from '#ts';
import useDragMove from '#hooks/useDragMove';

import {
    activeUserSelector,
    projectIdFromRouteSelector,
} from '#redux';

import Comment from './Comment';
import Review from './Review';
import styles from './styles.scss';


interface Position {
    top: number;
    left: number;
}

interface Props {
    className?: string;
    parentBCR?: Position;
    entryId: number;
    projectId: number;
    closeModal?: () => void;
    activeUser: {
        userId: number;
    };
}

const WINDOW_PADDING = 24;

interface MultiResponseWithSummary<T> extends MultiResponse<T> {
    summary: EntryReviewSummary;
}

const commentKeySelector = (d: EntryComment) => d.id;
const maxItemsPerPage = 50;

const mapStateToProps = (state: AppState) => ({
    activeUser: activeUserSelector(state),
    projectId: projectIdFromRouteSelector(state),
});

function EntryReviewModal(props: Props) {
    const {
        className,
        parentBCR,
        closeModal,
        entryId,
        projectId,
        activeUser,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [
        commentsPending,
        commentsResponse,
        ,
        getComments,
    ] = useRequest<MultiResponseWithSummary<EntryComment>>({
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
        let topCalc = parentBCR && top === 0 ? parentBCR.top : top;
        let leftCalc = parentBCR && left === 0 ? parentBCR.left - width : left;

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

    const commentRendererParams = useCallback((_, comment: EntryComment) => ({
        comment,
        className: styles.comment,
        activeUser,
    }), [activeUser]);

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

    const isApproved = commentsResponse?.summary.approvedBy
        .some(v => v.id === activeUser.userId) ?? false;

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
                        {_ts('entryReview', 'commentAndReviewHeading')}
                    </h3>
                    <DangerButton
                        iconName="close"
                        onClick={handleClose}
                        transparent
                    />
                </div>
                <div className={styles.content}>
                    {commentsPending && (<LoadingAnimation />)}
                    <Review
                        className={styles.review}
                        entryId={entryId}
                        pristine={pristine}
                        setPristine={setPristine}
                        onSuccess={getComments}
                        projectId={projectId}
                        isApproved={isApproved}
                        isVerified={commentsResponse?.summary.verified ?? false}
                    />
                    <List
                        data={commentsResponse?.results}
                        keySelector={commentKeySelector}
                        rendererParams={commentRendererParams}
                        renderer={Comment}
                    />
                    {commentsResponse && commentsResponse.count > maxItemsPerPage && (
                        <Pager
                            activePage={activePage}
                            itemsCount={commentsResponse.count}
                            maxItemsPerPage={maxItemsPerPage}
                            onPageClick={setActivePage}
                            showItemsPerPageChange={false}
                        />
                    )}
                </div>
                <div className={styles.footer}>
                    { commentsResponse && commentsResponse.summary.approvedBy.length > 0 && (
                        <>
                            {_ts('entryReview', 'approvedBy')}
                            <CommaSeparateItems
                                className={styles.approvedBy}
                                items={commentsResponse.summary.approvedBy}
                            />
                        </>
                    ) }
                </div>
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

export default connect(mapStateToProps)(EntryReviewModal);
