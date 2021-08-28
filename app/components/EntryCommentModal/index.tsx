import React, { useCallback, useState } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    Pager,
    QuickActionButton,
    ListView,
    Modal,
} from '@the-deep/deep-ui';
import {
    IoChatboxOutline,
} from 'react-icons/io5';

import {
    MultiResponse,
    EntryComment,
    EntryReviewSummary,
} from '#types';
import { useModalState } from '#hooks/stateManagement';
import { useRequest } from '#base/utils/restRequest';

import Comment from './Comment';
import CommentForm from './CommentForm';
import styles from './styles.css';

interface Props {
    className?: string;
    activityCount?: number;
    entryId: number;
    projectId: number;
}

interface MultiResponseWithSummary<T> extends MultiResponse<T> {
    summary: EntryReviewSummary;
}

const commentKeySelector = (d: EntryComment) => d.id;
const maxItemsPerPage = 50;

function EntryCommentModal(props: Props) {
    const {
        className,
        entryId,
        projectId,
        activityCount = 0,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [
        isCommentModalShown,
        showCommentModal,
        hideCommentModal,
    ] = useModalState(false);

    const {
        pending: commentsPending,
        response: commentsResponse,
        retrigger: getComments,
    } = useRequest<MultiResponseWithSummary<EntryComment>>({
        skip: !isCommentModalShown,
        url: `server://v2/entries/${entryId}/review-comments/`,
        method: 'GET',
        preserveResponse: true,
        query: {
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        failureHeader: 'Entry Comment',
    });

    const commentRendererParams = useCallback((_, comment: EntryComment) => ({
        comment,
    }), []);

    return (
        <>
            <QuickActionButton
                className={_cs(styles.commentButton, className)}
                onClick={showCommentModal}
                name={entryId}
            >
                <IoChatboxOutline />
                {activityCount > 0 && (
                    <div className={styles.commentCount}>
                        {activityCount}
                    </div>
                )}
            </QuickActionButton>
            {isCommentModalShown && (
                <Modal
                    className={styles.entryCommentModal}
                    heading="Entry Comments"
                    onCloseButtonClick={hideCommentModal}
                    bodyClassName={styles.modalBody}
                    footerActions={((commentsResponse?.count ?? 0) > maxItemsPerPage) && (
                        <Pager
                            activePage={activePage}
                            itemsCount={commentsResponse?.count ?? 0}
                            maxItemsPerPage={maxItemsPerPage}
                            onActivePageChange={setActivePage}
                            itemsPerPageControlHidden
                            hidePageNumberLabel
                            hideInfo
                            hidePrevAndNext
                        />
                    )}
                >
                    <CommentForm
                        entryId={entryId}
                        projectId={projectId}
                        onSave={getComments}
                    />
                    <ListView
                        data={commentsResponse?.results}
                        keySelector={commentKeySelector}
                        rendererParams={commentRendererParams}
                        renderer={Comment}
                        pending={commentsPending}
                    />
                </Modal>
            )}
        </>
    );
}

export default EntryCommentModal;
