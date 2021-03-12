import React from 'react';
import { _cs } from '@togglecorp/fujs';

import TextArea from '#rsci/TextArea';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import useRequest from '#utils/request';

import {
    useInputValue,
    useModalState,
} from '#hooks/stateManagement';

import { DatabaseEntityBase } from '#typings';
import _ts from '#ts';

import styles from './styles.scss';

interface ToggleEntryControlButtonProps {
    className?: string;
    entryId: DatabaseEntityBase['id'];
    initialValue: boolean;
}

function ToggleEntryControlButton(props: ToggleEntryControlButtonProps) {
    const {
        className,
        entryId,
        initialValue,
    } = props;

    const [controlled, setControlled] = React.useState(initialValue);
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
        controlled ? {
            commentType: 3,
        } : {
            commentType: 4,
            text: comment,
        }
    ), [controlled, comment]);

    const [
        reviewRequestPending,
        ,,
        triggerReviewRequest,
    ] = useRequest({
        url,
        autoTrigger: false,
        method: 'POST',
        body: formData,
        onFailure: () => {
            setControlled(prevValue => !prevValue);
        },
    });

    const handleClick = React.useCallback(() => {
        setControlled((prevValue) => {
            if (prevValue) {
                setCommentModalVisible();
            } else {
                triggerReviewRequest();
            }

            return true;
        });
    }, [setControlled, triggerReviewRequest, setCommentModalVisible]);

    const handleSubmitCommentButtonClick = React.useCallback(() => {
        setControlled(false);
        setCommentModalHidden();
        triggerReviewRequest();
    }, [setControlled, setCommentModalHidden, triggerReviewRequest]);

    return (
        <>
            <Button
                className={_cs(className, styles.toggleEntryControlButton)}
                onClick={handleClick}
                pending={reviewRequestPending}
            >
                {/* TODO: use strings */}
                { controlled ? 'Uncontrol' : 'Control' }
            </Button>
            { commentModalShown && (
                <Modal className={styles.commentModal}>
                    <ModalHeader
                        // TODO: use strings
                        title="Uncontrol entry"
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
                            {/* TODO: use strings */}
                            Submit
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            )}
        </>
    );
}

export default ToggleEntryControlButton;
