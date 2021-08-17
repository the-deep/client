import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmark, IoClose } from 'react-icons/io5';
import {
    Button,
    Tag,
} from '@the-deep/deep-ui';

import { Entry } from '#types/newEntry';
import { useModalState } from '#hooks/stateManagement';
import { useLazyRequest } from '#base/utils/restRequest';

import EntryUnverifyCommentModal from './EntryUnverifyCommentModal';
import styles from './styles.css';

interface EntryVerificationFormData {
    commentType: number;
    text?: string;
    mentionedUsers?: number[];
}

interface Props {
    className?: string;
    entryId: number;
    projectId: number;
    value: boolean;
    disabled?: boolean;
    onSuccess?: (value: Entry) => void;
    verifiedByCount: number;
}

const VERIFY = 1;
const UNVERIFY = 2;

function EntryVerification(props: Props) {
    const {
        className,
        projectId,
        entryId,
        value,
        onSuccess,
        disabled,
        verifiedByCount,
    } = props;

    const [
        commentModalShown,
        setCommentModalVisible,
        setCommentModalHidden,
    ] = useModalState(false);

    const {
        pending: reviewRequestPending,
        trigger: triggerReviewRequest,
    } = useLazyRequest<Entry, EntryVerificationFormData>({
        url: `server://v2/entries/${entryId}/review-comments/`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (onSuccess) {
                onSuccess(response);
            }
            setCommentModalHidden();
        },
        failureHeader: 'Entry Verification',
    });

    const handleClick = useCallback(() => {
        if (value) {
            setCommentModalVisible();
        } else {
            triggerReviewRequest({ commentType: VERIFY });
        }
    }, [value, triggerReviewRequest, setCommentModalVisible]);

    const handleUnverifyEntry = useCallback((formValues: Omit<EntryVerificationFormData, 'commentType'>) => {
        triggerReviewRequest({ commentType: UNVERIFY, ...formValues });
    }, [triggerReviewRequest]);

    return (
        <div
            className={_cs(className, styles.toggleEntryVerification)}
        >
            <Button
                name="entryVerification"
                className={_cs(className, styles.toggleVerificationButton)}
                variant={(
                    value ? 'primary' : 'secondary'
                )}
                actions={(
                    <Tag
                        actions={(
                            value
                                ? <IoCheckmark />
                                : <IoClose />
                        )}
                    >
                        {verifiedByCount}
                    </Tag>
                )}
                onClick={handleClick}
                disabled={reviewRequestPending || disabled}
            >
                Verify
            </Button>
            {commentModalShown && (
                <EntryUnverifyCommentModal
                    projectId={projectId}
                    onValidationSuccess={handleUnverifyEntry}
                    onModalClose={setCommentModalHidden}
                />
            )}
        </div>
    );
}

export default EntryVerification;
