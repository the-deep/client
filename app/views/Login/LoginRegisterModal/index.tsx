import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Heading,
    Modal,
} from '@the-deep/deep-ui';

import Svg from '#components/Svg';
import _ts from '#ts';
import deepLogo from '#resources/img/deep-logo-new.svg';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

import styles from './styles.css';

interface Props {
    className?: string;
    onClose: () => void;
    onForgotPasswordClick: (email?: string) => void;
}

function LoginRegisterModal(props: Props) {
    const {
        className,
        onClose,
        onForgotPasswordClick,
    } = props;

    return (
        <Modal
            className={_cs(styles.modal, className)}
            headerClassName={styles.header}
            headingSize="small"
            closeButtonClassName={styles.closeButton}
            heading={(
                <div className={styles.headingContainer}>
                    <Svg
                        className={styles.deepLogo}
                        src={deepLogo}
                    />
                    <div className={styles.rightContainer}>
                        <Heading className={styles.topText}>
                            {_ts('explore.login', 'welcomeToDeepText')}
                        </Heading>
                        <Heading className={styles.bottomText}>
                            {_ts('explore.login', 'deepSubText')}
                        </Heading>
                    </div>
                </div>
            )}
            footer={_ts('explore', 'closeModalToExploreDeepLabel')}
            footerClassName={styles.footer}
            onCloseButtonClick={onClose}
            bodyClassName={styles.content}
        >
            <LoginForm
                className={styles.login}
                onForgotPasswordClick={onForgotPasswordClick}
            />
            <RegisterForm />
        </Modal>
    );
}

export default LoginRegisterModal;
