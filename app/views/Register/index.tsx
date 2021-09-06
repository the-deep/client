import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Card } from '@the-deep/deep-ui';

import WelcomeContent from '#components/WelcomeContent';

import RegisterForm from './RegisterForm';
import styles from './styles.css';

interface Props {
    className?: string;
}

function Register(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(styles.register, className)}>
            <Card className={styles.card}>
                <WelcomeContent className={styles.welcomeContent} />
                <RegisterForm className={styles.rightContent} />
            </Card>
        </div>
    );
}

export default Register;
