import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { AiFillQuestionCircle } from 'react-icons/ai';

import TextArea from '#rsci/TextArea';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import useRequest from '#utils/request';

import ElementFragments from '#components/ui/ElementFragments';
import {
    useInputValue,
    useModalState,
} from '#hooks/stateManagement';
import { notifyError } from '#utils/requestNotify';
import notify from '#notify';

import { DatabaseEntityBase } from '#typings';
import _ts from '#ts';

import styles from './styles.scss';

interface ToggleEntryVerificationProps {
    className?: string;
    entryId: DatabaseEntityBase['id'];
    onChange: (newValue: boolean) => void;
    onPendingStatusChange?: (newValue: boolean) => void;
    value: boolean;
    tooltip?: string;
    disabled?: boolean;
}

function ToggleEntryVerification(props: ToggleEntryVerificationProps) {
    const {
        className,
        entryId,
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

    const [comment, setComment] = useInputValue('');

    const url = `server://v2/entries/${entryId}/review-comments/`;
    const formData = React.useMemo(() => (
        // 3: control
        // 4: uncontrol
        value ? {
            commentType: 4,
            text: comment,
        } : {
            commentType: 3,
        }
    ), [value, comment]);

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

    const handleSubmitCommentButtonClick = React.useCallback(() => {
        setCommentModalHidden();
        triggerReviewRequest();
    }, [setCommentModalHidden, triggerReviewRequest]);

    return (
        <>
            <div
                title={tooltip}
                className={
                    _cs(
                        className,
                        styles.toggleEntryControlButton,
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
            </div>
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
                    <ModalBody>
                        <TextArea
                            value={comment}
                            onChange={setComment}
                            label={_ts('entryReview', 'comment')}
                            rows={3}
                            autoFocus
                        />
                    </ModalBody>
                    <ModalFooter>
                        <PrimaryButton onClick={handleSubmitCommentButtonClick}>
                            {_ts('entryReview', 'submitButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            )}
        </>
    );
}

export default ToggleEntryVerification;
