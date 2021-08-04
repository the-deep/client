import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmark, IoClose } from 'react-icons/io5';
import {
    ElementFragments,
} from '@the-deep/deep-ui';

import Button from '#rsca/Button';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import EntryCommentFormForModal from '#components/general/EntryCommentFormForModal';

import { useModalState } from '#hooks/stateManagement';
import notify from '#notify';
import { useLazyRequest } from '#utils/request';

import { DatabaseEntityBase } from '#typings';
import _ts from '#ts';

import styles from './styles.scss';

interface ToggleEntryVerificationProps {
    className?: string;
    entryId: DatabaseEntityBase['id'];
    projectId: DatabaseEntityBase['id'];
    onChange: (newValue: boolean, newCount: number) => void;
    onPendingStatusChange?: (newValue: boolean) => void;
    value: boolean;
    tooltip?: string;
    disabled?: boolean;
    verifyCount: number;
}

const VERIFY = 1;
const UNVERIFY = 2;

function ToggleEntryVerification(props: ToggleEntryVerificationProps) {
    const {
        className,
        entryId,
        projectId,
        value,
        onChange,
        onPendingStatusChange,
        tooltip,
        disabled,
        verifyCount,
    } = props;

    const [
        commentModalShown,
        setCommentModalVisible,
        setCommentModalHidden,
    ] = useModalState(false);

    const {
        pending: reviewRequestPending,
        trigger: triggerReviewRequest,
    } = useLazyRequest<unknown, { commentType: number }>({
        url: `server://v2/entries/${entryId}/review-comments/`,
        method: 'POST',
        body: ctx => ctx,
        onSuccess: () => {
            // FIXME: use verifyCount from the response
            onChange(!value, value ? (verifyCount - 1) : (verifyCount + 1));
            setCommentModalHidden();

            notify.send({
                title: _ts('editEntry', 'entryVerificationStatusChange'),
                type: notify.type.SUCCESS,
                message: _ts('editEntry', 'entryVerificationStatusChangeSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        failureHeader: _ts('editEntry', 'entryVerificationStatusChange'),
    });

    React.useEffect(() => {
        if (onPendingStatusChange) {
            onPendingStatusChange(reviewRequestPending);
        }
    }, [reviewRequestPending, onPendingStatusChange]);

    const handleClick = React.useCallback(() => {
        if (value) {
            setCommentModalVisible();
        } else {
            triggerReviewRequest({ commentType: VERIFY });
        }
    }, [value, triggerReviewRequest, setCommentModalVisible]);

    const handleUnverifyFormValidationSuccess = React.useCallback((newData) => {
        triggerReviewRequest({ commentType: UNVERIFY, ...newData });
    }, [triggerReviewRequest]);

    const verificationStatus = React.useMemo(() => {
        let text = '';

        if (value && verifyCount <= 1) {
            text = _ts('entryReview', 'verifiedOnlyByUserLabel');
            // 'Verified only by you';
        } else if (value && verifyCount > 1) {
            text = _ts('entryReview', 'verifiedByUserAndOthersLabel', {
                userCount: verifyCount - 1,
            });
            // `Verified by you and ${verifyCount} other users`;
        } else if (!value && verifyCount === 0) {
            text = _ts('entryReview', 'notVerifiedLabel');
            // 'Not verified';
        } else {
            text = _ts('entryReview', 'notVerifiedByUserButVerifiedByOthersLabel', {
                userCount: verifyCount,
            });
            // `Not verified by you (Verified by ${verifyCount} other users)`;
        }

        return text;
    }, [value, verifyCount]);

    return (
        <div
            title={tooltip ?? verificationStatus}
            className={
                _cs(
                    className,
                    styles.toggleEntryVerification,
                    value && styles.verified,
                )
            }
        >
            <ElementFragments
                iconsContainerClassName={styles.icons}
                childrenContainerClassName={styles.children}
                actionsContainerClassName={styles.actions}
                icons={
                    <Button
                        className={styles.toggleButton}
                        onClick={handleClick}
                        pending={reviewRequestPending}
                        disabled={disabled}
                    >
                        { value ? _ts('entryReview', 'unverifyLabel') : _ts('entryReview', 'verifyLabel') }
                    </Button>
                }
                actions={verifyCount}
            >
                {value ?
                    <IoCheckmark className={styles.icon} /> :
                    <IoClose className={styles.icon} />
                }
            </ElementFragments>
            { commentModalShown && (
                <Modal className={styles.commentModal}>
                    <ModalHeader
                        title={_ts('entryReview', 'unverifyEntryLabel')}
                        rightComponent={
                            <Button
                                onClick={setCommentModalHidden}
                                transparent
                                iconName="close"
                            />
                        }
                    />
                    <EntryCommentFormForModal
                        disabled={reviewRequestPending}
                        projectId={projectId}
                        onValidationSuccess={handleUnverifyFormValidationSuccess}
                    />
                </Modal>
            )}
        </div>
    );
}

export default ToggleEntryVerification;
