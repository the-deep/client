import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Card } from '@the-deep/deep-ui';

import WelcomeContent from '#components/general/WelcomeContent';
import LoginForm from './LoginForm';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Login(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(styles.login, className)}>
            <Card className={styles.card}>
                <WelcomeContent className={styles.welcomeContent} />
                <LoginForm className={styles.rightContent} />
            </Card>
        </div>
    );
}

export default Login;
