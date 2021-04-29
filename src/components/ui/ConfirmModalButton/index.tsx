import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    Modal,
} from '@the-deep/deep-ui';

import styles from './styles.scss';

export interface ConfirmModalButtonProps {
    children?: React.ReactNode;
    heading?: React.ReactNode;
    footer?: React.ReactNode;
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

    return (
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
                        name={undefined}
                        className={_cs(
                            'cancel-button',
                            styles.button,
                        )}
                        autoFocus
                        onClick={onModalClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        name={undefined}
                        className={_cs(
                            'ok-button',
                            styles.button,
                        )}
                        onClick={onSuccess}
                    >
                        Ok
                    </Button>
                </>
            }
        >
            {children}
        </Modal>

    );
}

export default ConfirmModalButton;
