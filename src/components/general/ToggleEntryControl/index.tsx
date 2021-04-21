import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { AiFillQuestionCircle } from 'react-icons/ai';
import {
    ElementFragments,
} from '@the-deep/deep-ui';

import Button from '#rsca/Button';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';

import EntryCommentFormForModal from '#components/general/EntryCommentFormForModal';

import { useModalState } from '#hooks/stateManagement';
import notify from '#notify';
import useRequest from '#utils/request';
import { notifyError } from '#utils/requestNotify';

import { DatabaseEntityBase } from '#typings';
import _ts from '#ts';

import styles from './styles.scss';

interface ToggleEntryControlProps {
    className?: string;
    entryId: DatabaseEntityBase['id'];
    projectId: DatabaseEntityBase['id'];
    onChange: (newValue: boolean) => void;
    onPendingStatusChange?: (newValue: boolean) => void;
    value: boolean;
    tooltip?: string;
    disabled?: boolean;
}

const CONTROL = 3;
const UNCONTROL = 4;

const controlFormData = { commentType: CONTROL };

function ToggleEntryControl(props: ToggleEntryControlProps) {
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

    const [uncontrolFormData, setUncontrolFormData] = React.useState({
        commentType: UNCONTROL,
    });

    const url = `server://v2/entries/${entryId}/review-comments/`;
    const formData = React.useMemo(() => (
        value ? uncontrolFormData : controlFormData
    ), [value, uncontrolFormData]);

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
                title: _ts('editEntry', 'entryControlStatusChange'),
                type: notify.type.SUCCESS,
                message: _ts('editEntry', 'entryControlStatusChangeSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        onFailure: notifyError(_ts('editEntry', 'entryControlFailure')),
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

    const handleUncontrolFormValidationSuccess = React.useCallback((newData) => {
        setUncontrolFormData(prevData => ({
            ...prevData,
            ...newData,
        }));
        triggerReviewRequest();
    }, [setUncontrolFormData, triggerReviewRequest]);

    return (
        <>
            <Button
                title={tooltip}
                className={
                    _cs(
                        className,
                        styles.toggleEntryControl,
                        value && styles.controlled,
                    )
                }
                onClick={handleClick}
                pending={reviewRequestPending}
                disabled={disabled}
            >
                <ElementFragments
                    icons={value ? (
                        <IoCheckmarkCircle className={styles.icon} />
                    ) : (
                        <AiFillQuestionCircle className={styles.icon} />
                    )}
                >
                    { value ? _ts('entryReview', 'controlledLabel') : _ts('entryReview', 'uncontrolledLabel') }
                </ElementFragments>
            </Button>
            { commentModalShown && (
                <Modal className={styles.commentModal}>
                    <ModalHeader
                        title={_ts('entryReview', 'uncontrolledEntryLabel')}
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
                        onValidationSuccess={handleUncontrolFormValidationSuccess}
                    />
                </Modal>
            )}
        </>
    );
}

export default ToggleEntryControl;
