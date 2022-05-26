import React, { useCallback, useContext } from 'react';

import EntryComments, { Props as EntryCommentsProps } from '#components/entryReview/EntryComments';
import CommentCountContext from '#components/entryReview/EntryCommentWrapper/CommentContext';

function EntryCommentWrapper(props: EntryCommentsProps) {
    const {
        entryId,
    } = props;

    const {
        commentsCountMap,
        setCommentsCountMap,
    } = useContext(CommentCountContext);
    const handleEntryCommentAdd = useCallback(() => {
        setCommentsCountMap((oldCounts) => ({
            ...oldCounts,
            [String(entryId)]: (oldCounts?.[String(entryId)] ?? 0) + 1,
        }));
    }, [entryId, setCommentsCountMap]);

    return (
        <EntryComments
            {...props}
            entryId={entryId}
            activityCount={commentsCountMap?.[String(entryId)]}
            onEntryCommentAdd={handleEntryCommentAdd}
        />
    );
}

export default EntryCommentWrapper;
