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
import notify from '#notify';
import useRequest from '#utils/request';
import { notifyError } from '#utils/requestNotify';

import { DatabaseEntityBase } from '#typings';
import _ts from '#ts';

import styles from './styles.scss';

interface ToggleEntryVerificationProps {
    className?: string;
    entryId: DatabaseEntityBase['id'];
    projectId: DatabaseEntityBase['id'];
    onChange: (newValue: boolean) => void;
    onPendingStatusChange?: (newValue: boolean) => void;
    value: boolean;
    tooltip?: string;
    disabled?: boolean;
}

const VERIFY = 3;
const UNVERIFY = 4;

const verifyFormData = { commentType: VERIFY };

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
    } = props;

    const [
        commentModalShown,
        setCommentModalVisible,
        setCommentModalHidden,
    ] = useModalState(false);

    const [unverifyFormData, setUnverifyFormData] = React.useState({
        commentType: UNVERIFY,
    });

    const url = `server://v2/entries/${entryId}/review-comments/`;
    const formData = React.useMemo(() => (
        value ? unverifyFormData : verifyFormData
    ), [value, unverifyFormData]);

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
            onChange(!value);
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

    const handleUnverifyFormValidationSuccess = React.useCallback((newData) => {
        setUnverifyFormData(prevData => ({
            ...prevData,
            ...newData,
        }));
        triggerReviewRequest();
    }, [setUnverifyFormData, triggerReviewRequest]);

    return (
        <div
            title={tooltip}
            className={
                _cs(
                    className,
                    styles.toggleEntryVerification,
                    value && styles.verified,
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
                        { value ? _ts('entryReview', 'unverifyLabel') : _ts('entryReview', 'verifyLabel') }
                    </Button>
                }
            >
                { value ? _ts('entryReview', 'verifiedLabel') : _ts('entryReview', 'unverifiedLabel') }
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
