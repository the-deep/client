import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { AiFillQuestionCircle } from 'react-icons/ai';

import Button from '#rsca/Button';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import EntryCommentFormForModal from '#components/general/EntryCommentFormForModal';

import ElementFragments from '#components/ui/ElementFragments';
import { useModalState } from '#hooks/stateManagement';
import { notifyError } from '#utils/requestNotify';
import notify from '#notify';
import useRequest from '#utils/request';

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
    approvalCount: number;
}

const APPROVE = 1;
const UNAPPROVE = 2;

const approveFormData = { commentType: APPROVE };

function ToggleEntryApproval(props: ToggleEntryVerificationProps) {
    const {
        className,
        entryId,
        projectId,
        value,
        onChange,
        onPendingStatusChange,
        tooltip,
        disabled,
        approvalCount,
    } = props;

    const [
        commentModalShown,
        setCommentModalVisible,
        setCommentModalHidden,
    ] = useModalState(false);

    const [unapproveFormData, setUnapproveFormData] = React.useState({
        commentType: UNAPPROVE,
    });

    const url = `server://v2/entries/${entryId}/review-comments/`;
    const formData = React.useMemo(() => (
        value ? unapproveFormData : approveFormData
    ), [value, unapproveFormData]);

    const [
        reviewRequestPending,
        ,,
        triggerReviewRequest,
    ] = useRequest({
        url,
        autoTrigger: false,
        method: 'POST',
        body: formData,
        onSuccess: () => {
            // FIXME: use approvalCount from the response
            onChange(!value, value ? (approvalCount - 1) : (approvalCount + 1));
            setCommentModalHidden();

            notify.send({
                title: _ts('editEntry', 'entryVerificationStatusChange'),
                type: notify.type.SUCCESS,
                message: _ts('editEntry', 'entryVerificationStatusChangeSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        onFailure: notifyError(_ts('editEntry', 'entryVerifyFailure')),
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
            triggerReviewRequest();
        }
    }, [value, triggerReviewRequest, setCommentModalVisible]);

    const handleUnapproveFormValidationSuccess = React.useCallback((newData) => {
        setUnapproveFormData(prevData => ({
            ...prevData,
            ...newData,
        }));
        triggerReviewRequest();
    }, [setUnapproveFormData, triggerReviewRequest]);

    // FIXME: use strings
    const approvalStatus = React.useMemo(() => {
        let text = '';

        if (value && approvalCount <= 1) {
            text = _ts('entryReview', 'approvedOnlyByUserLabel');
            // 'Approved only by you';
        } else if (value && approvalCount > 1) {
            text = _ts('entryReview', 'approvedByUserAndOthersLabel', {
                userCount: approvalCount - 1,
            });
            // `Approved by you and ${approvalCount} other users`;
        } else if (!value && approvalCount === 0) {
            text = _ts('entryReview', 'notApprovedLabel');
            // 'Not approved';
        } else {
            text = _ts('entryReview', 'notApprovedByUserButApprovedByOthersLabel', {
                userCount: approvalCount,
            });
            // `Not approved by you (Approved by ${approvalCount} other users)`;
        }

        return text;
    }, [value, approvalCount]);

    return (
        <div
            title={tooltip}
            className={
                _cs(
                    className,
                    styles.toggleEntryApproval,
                    value && styles.approved,
                )
            }
        >
            <ElementFragments
                icons={value ? (
                    <IoCheckmarkCircle className={styles.icon} />
                ) : (
                    <AiFillQuestionCircle className={styles.icon} />
                )}
                actions={
                    <Button
                        onClick={handleClick}
                        pending={reviewRequestPending}
                        disabled={disabled}
                    >
                        { value ? _ts('entryReview', 'unapproveLabel') : _ts('entryReview', 'approveLabel') }
                    </Button>
                }
            >
                { approvalStatus }
            </ElementFragments>
            { commentModalShown && (
                <Modal className={styles.commentModal}>
                    <ModalHeader
                        title={_ts('entryReview', 'unapproveEntryLabel')}
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
                        onValidationSuccess={handleUnapproveFormValidationSuccess}
                    />
                </Modal>
            )}
        </div>
    );
}

export default ToggleEntryApproval;
