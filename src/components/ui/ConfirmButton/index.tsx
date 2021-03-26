import React, { ReactNode, useState, useCallback } from 'react';

import { _cs } from '@togglecorp/fujs';

import Button from '#components/ui/Button';
import Modal from '#components/ui/Modal';

import styles from './styles.scss';

export interface ConfirmButtonProps {
    confirmLabel?: ReactNode;
    cancelLabel?: ReactNode;
    onConfirm: () => void;
    confirmButtonClassName?: string;
    cancelButtonClassName?: string;
    confirmationHeader?: ReactNode;
    confirmationMessage?: ReactNode;
    onCancel?: () => void;
    children?: ReactNode;
    className?: string;
}

function ConfirmButton(props: ConfirmButtonProps) {
    const {
        confirmationHeader = 'Confirmation',
        confirmationMessage = 'Are you sure?',
        onConfirm,
        onCancel,
        confirmButtonClassName,
        cancelButtonClassName,
        confirmLabel = 'Confirm',
        cancelLabel = 'Cancel',
        className,
        ...otherProps
    } = props;

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleConfirmModalShow = useCallback(() => {
        setShowConfirmModal(true);
    }, []);

    const handleConfirmModalClose = useCallback(() => {
        if (onCancel) {
            onCancel();
        }

        setShowConfirmModal(false);
    }, [onCancel]);

    const handleConfirmModalConfirm = useCallback(() => {
        onConfirm();
        setShowConfirmModal(false);
    }, [onConfirm]);

    return (
        <>
            <Button
                className={_cs(styles.confirmButton, className)}
                {...otherProps}
                onClick={handleConfirmModalShow}
            />
            {showConfirmModal && (
                <Modal
                    heading={confirmationHeader}
                    onClose={handleConfirmModalClose}
                    footerClassName={styles.actionButtonsRow}
                    footer={(
                        <>
                            <Button
                                className={_cs(styles.actionButton, cancelButtonClassName)}
                                name="cancel-button"
                                onClick={handleConfirmModalClose}
                            >
                                {cancelLabel}
                            </Button>
                            <Button
                                className={_cs(styles.actionButton, confirmButtonClassName)}
                                name="confirm-button"
                                onClick={handleConfirmModalConfirm}
                                variant="primary"
                                autoFocus
                            >
                                {confirmLabel}
                            </Button>
                        </>
                    )}
                >
                    {confirmationMessage}
                </Modal>
            )}
        </>
    );
}

export default ConfirmButton;
