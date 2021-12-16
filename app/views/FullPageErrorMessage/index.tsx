import React from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    ButtonLikeLink,
    KrakenProps,
    Kraken,
} from '@the-deep/deep-ui';

import deepLogo from '#resources/img/deep-logo-new.svg';
import Svg from '#components/Svg';

import waterLevelImage from './water-level.png';
import styles from './styles.css';

interface Props {
    errorTitle?: string;
    krakenVariant?: KrakenProps['variant'];
    errorMessage?: React.ReactNode;
    className?: string;
}

function FullPageErrorMessage(props: Props) {
    const {
        errorTitle,
        errorMessage,
        krakenVariant,
        className,
    } = props;

    return (
        <div className={_cs(styles.errorPage, className)}>
            <div className={styles.logoContainer}>
                <Svg
                    src={deepLogo}
                    className={styles.logo}
                />
            </div>
            <div className={styles.background}>
                <img
                    src={waterLevelImage}
                    className={styles.backgroundImage}
                    alt=""
                />
                <Kraken
                    className={styles.kraken}
                    variant={krakenVariant}
                />
                <div className={styles.content}>
                    <h2 className={styles.errorMessageTitle}>
                        {errorTitle}
                    </h2>
                    <div className={styles.errorMessage}>
                        {errorMessage}
                    </div>
                    <ButtonLikeLink
                        className={styles.button}
                        variant="primary"
                        to="/"
                    >
                        Go to Home
                    </ButtonLikeLink>
                </div>
            </div>
            <div className={styles.footer}>
                Copyright @DFS 2021
            </div>

        </div>
    );
}
export default FullPageErrorMessage;
