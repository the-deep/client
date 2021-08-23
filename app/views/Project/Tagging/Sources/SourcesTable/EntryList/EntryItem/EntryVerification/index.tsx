import React, { useCallback, useContext, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmark, IoClose } from 'react-icons/io5';
import {
    Button,
    Tag,
} from '@the-deep/deep-ui';

import { EntryReviewComment } from '#types/newEntry';
import { useModalState } from '#hooks/stateManagement';
import { useLazyRequest } from '#base/utils/restRequest';
import UserContext from '#base/context/UserContext';

import EntryUnverifyCommentModal from './EntryUnverifyCommentModal';
import styles from './styles.css';

export interface EntryVerificationFormData {
    commentType: number;
    text?: string;
    mentionedUsers?: number[];
}

interface Props {
    className?: string;
    entryId: number;
    projectId: number;
    disabled?: boolean;
    verifiedBy: number[];
    onVerificationChange: (entryId: number) => void;
}

const VERIFY = 1;

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
        failureHeader: 'Entry Verification',
    });

    const handleClick = useCallback(() => {
        if (isVerifiedByUser) {
            setCommentModalVisible();
        } else {
            triggerReviewRequest({ commentType: VERIFY });
        }
    }, [isVerifiedByUser, triggerReviewRequest, setCommentModalVisible]);

    return (
        <div
            className={_cs(className, styles.toggleEntryVerification)}
        >
            <Button
                name="entryVerification"
                className={styles.verificationButton}
                variant={(
                    isVerifiedByUser ? 'primary' : 'secondary'
                )}
                actions={(
                    <Tag
                        actions={(
                            verifiedBy.length > 0
                                ? <IoCheckmark />
                                : <IoClose />
                        )}
                    >
                        {verifiedBy.length}
                    </Tag>
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
        </div>
    );
}

export default EntryVerification;
