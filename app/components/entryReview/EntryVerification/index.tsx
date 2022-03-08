import React, { useCallback, useContext, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmark, IoClose } from 'react-icons/io5';
import {
    Button,
} from '@the-deep/deep-ui';

import { EntryReviewComment } from '#types/entry';
import { useModalState } from '#hooks/stateManagement';
import { useLazyRequest } from '#base/utils/restRequest';
import UserContext from '#base/context/UserContext';

import { EntryAction } from '#components/entryReview/commentConstants';
import EntryUnverifyCommentModal from './EntryUnverifyCommentModal';
import styles from './styles.css';

interface EntryVerificationFormData {
    commentType: number;
}

interface Props {
    className?: string;
    entryId: string;
    projectId: string;
    disabled?: boolean;
    verifiedBy: number[];
    onVerificationChange: (entryId: string) => void;
}

function EntryVerification(props: Props) {
    const {
        className,
        projectId,
        entryId,
        verifiedBy,
        disabled,
        onVerificationChange,
    } = props;

    const {
        user,
    } = useContext(UserContext);

    const isVerifiedByUser = useMemo(() => (
        verifiedBy.some((v) => v.toString() === user?.id)
    ), [verifiedBy, user?.id]);

    const [
        commentModalShown,
        setCommentModalVisible,
        setCommentModalHidden,
    ] = useModalState(false);

    const {
        pending: reviewRequestPending,
        trigger: triggerReviewRequest,
    } = useLazyRequest<EntryReviewComment, EntryVerificationFormData>({
        url: `server://v2/entries/${entryId}/review-comments/`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            onVerificationChange(response.entry);
        },
        failureMessage: 'Entry Verification',
    });

    const handleClick = useCallback(() => {
        if (isVerifiedByUser) {
            setCommentModalVisible();
        } else {
            triggerReviewRequest({ commentType: EntryAction.VERIFY });
        }
    }, [isVerifiedByUser, triggerReviewRequest, setCommentModalVisible]);

    return (
        <>
            <Button
                className={_cs(className, styles.toggleEntryVerification)}
                name="entryVerification"
                variant="secondary"
                actionsContainerClassName={styles.verifyActions}
                actions={(
                    <>
                        <div>
                            {verifiedBy.length}
                        </div>
                        {
                            verifiedBy.length > 0
                                ? <IoCheckmark />
                                : <IoClose />
                        }
                    </>
                )}
                onClick={handleClick}
                disabled={reviewRequestPending || disabled}
            >
                {isVerifiedByUser ? 'Unverify' : 'Verify'}
            </Button>
            {commentModalShown && (
                <EntryUnverifyCommentModal
                    entryId={entryId}
                    projectId={projectId}
                    onVerificationChange={onVerificationChange}
                    onModalClose={setCommentModalHidden}
                />
            )}
        </>
    );
}

export default EntryVerification;
