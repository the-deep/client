import React, { useCallback, useState } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';

import {
    Pager,
    ListView,
    Modal,
} from '@the-deep/deep-ui';

import {
    MultiResponse,
    EntryComment,
    EntryReviewSummary,
} from '#types';
import { useRequest } from '#base/utils/restRequest';

import Comment from './Comment';
import CommentForm from './CommentForm';
import styles from './styles.css';

interface Props {
    className?: string;
    onModalClose: () => void;
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
        onModalClose,
        entryId,
        projectId,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const {
        pending: commentsPending,
        response: commentsResponse,
        retrigger: getComments,
    } = useRequest<MultiResponseWithSummary<EntryComment>>({
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
        <Modal
            className={_cs(className, styles.entryCommentModal)}
            heading="Entry Comments"
            onCloseButtonClick={onModalClose}
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
    );
}

export default EntryCommentModal;
