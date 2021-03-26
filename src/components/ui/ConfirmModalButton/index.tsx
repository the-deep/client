import React, { ReactNode, useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Modal from '#dui/Modal';
import Button from '#dui/Button';
import ConfirmButton from '#dui/ConfirmButton';

import styles from './styles.scss';

export interface ConfirmModalButtonProps {
    children?: ReactNode;
    heading?: ReactNode;
    footer?: ReactNode;
    className?: string;
    bodyClassName?: string;
    headingClassName?: string;
    footerClassName?: string;
    onModalClose: () => void;
    closeButtonHidden?: boolean;
    onSuccess: () => void;
}


function ConfirmModalButton(props: ConfirmModalButtonProps) {
    const {
        heading,
        children,

        className,
        headingClassName,
        bodyClassName,
        footerClassName,

        onModalClose,

        closeButtonHidden,
        onSuccess,
    } = props;

    const [showConfirmModal, setShowConfirmModal] = useState(true);

    const handleCancelButton = useCallback(() => {
        onModalClose();
        setShowConfirmModal(false);
    }, [onModalClose]);

    return (
        <>
            {showConfirmModal && (
                <Modal
                    className={_cs(
                        className,
                        'confirm',
                        styles.confirm,
                    )}
                    onClose={onModalClose}
                    heading={heading}
                    headingClassName={headingClassName}
                    bodyClassName={bodyClassName}
                    footerClassName={_cs(
                        footerClassName,
                        styles.footer,
                    )}
                    closeButtonHidden={closeButtonHidden}
                    footer={
                        <>
                            <Button
                                className={_cs(
                                    'cancel-button',
                                    styles.button,
                                )}
                                autoFocus
                                onClick={handleCancelButton}
                            >
                                Cancel
                            </Button>
                            <ConfirmButton
                                className={_cs(
                                    'ok-button',
                                    styles.button,
                                )}
                                onConfirm={onSuccess}
                            >
                                Ok
                            </ConfirmButton>
                        </>
                    }
                >
                    {children}
                </Modal>
            )}
        </>
    );
}

export default ConfirmModalButton;
