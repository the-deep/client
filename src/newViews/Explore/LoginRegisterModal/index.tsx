import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Heading,
    Modal,
} from '@the-deep/deep-ui';

import Icon from '#rscg/Icon';
import _ts from '#ts';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

import styles from './styles.scss';

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
                    <Icon
                        className={styles.deepLogo}
                        name="deepLogo"
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
