import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { generatePath } from 'react-router-dom';

import { ButtonLikeLink } from '@the-deep/deep-ui';

import deepLogo from '#resources/img/deep-logo-new.svg';
import Svg from '#components/Svg';
import routes from '#base/configs/routes';

import waterLevelImage from './water-level.png';

import styles from './styles.css';

interface Props {
    errorTitle?: string;
    errorImage?: string;
    errorMessage?: React.ReactNode;
    className?: string;
}

function FullPageErrorMessage(props: Props) {
    const {
        errorTitle,
        errorMessage,
        errorImage,
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
                <img
                    className={styles.kraken}
                    alt=""
                    src={errorImage}
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
                        to={generatePath(routes.home.path)}
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
