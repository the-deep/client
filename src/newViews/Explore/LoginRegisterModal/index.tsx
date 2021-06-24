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
}

function LoginRegisterModal(props: Props) {
    const {
        className,
        onClose,
    } = props;

    return (
        <Modal
            className={_cs(styles.modal, className)}
            headerClassName={styles.header}
            closeButtonClassname={styles.closeButton}
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
            onCloseButtonClick={onClose}
            bodyClassName={styles.content}
        >
            <LoginForm className={styles.login} />
            <RegisterForm />
        </Modal>
    );
}

export default LoginRegisterModal;
