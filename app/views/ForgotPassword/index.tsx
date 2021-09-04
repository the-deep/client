import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Card } from '@the-deep/deep-ui';

import WelcomeContent from '#components/WelcomeContent';
import ForgotPasswordForm from './ForgotPasswordForm';

import styles from './styles.css';

interface Props {
    className?: string;
}

function ForgotPassword(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(styles.forgotPassword, className)}>
            <Card className={styles.card}>
                <WelcomeContent className={styles.welcomeContent} />
                <ForgotPasswordForm className={styles.rightContent} />
            </Card>
        </div>
    );
}

export default ForgotPassword;
