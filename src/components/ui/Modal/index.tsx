import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Button from '../Button';
import BodyBackdrop from '../BodyBackdrop';

import styles from './styles.scss';

export interface ModalProps {
    children?: React.ReactNode;
    heading?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    bodyClassName?: string;
    headingClassName?: string;
    footerClassName?: string;
    onClose: () => void;
    closeButtonHidden?: boolean;
}

function Modal(props: ModalProps) {
    const {
        heading,
        children,
        footer,

        className,
        headingClassName,
        bodyClassName,
        footerClassName,

        onClose,

        closeButtonHidden,
    } = props;

    return (
        <BodyBackdrop>
            <div
                className={_cs(
                    className,
                    styles.modal,
                )}
            >
                {heading !== null && (
                    <div className={_cs(styles.modalHeader, headingClassName)}>
                        <h2 className={styles.titleContainer}>
                            {heading}
                        </h2>
                        {!closeButtonHidden && (
                            <div className={styles.actions}>
                                <Button
                                    className={styles.closeButton}
                                    onClick={onClose}
                                    name="Close"
                                >
                                    <Icon name="close" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
                <div className={_cs(styles.modalBody, bodyClassName)}>
                    {children}
                </div>
                {footer && (
                    <div className={_cs(styles.modalFooter, footerClassName)}>
                        {footer}
                    </div>
                )}
            </div>
        </BodyBackdrop>
    );
}

export default Modal;
