import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Heading } from '@the-deep/deep-ui';
import {
    IoCompassOutline,
} from 'react-icons/io5';

import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import Svg from '#components/Svg';
import deepLogo from '#resources/img/logo.svg';
import routes from '#base/configs/routes';
import _ts from '#ts';

import styles from './styles.css';

interface Props {
    className?: string;
}

function WelcomeContent(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.welcomeContent)}>
            <Svg
                className={styles.deepLogo}
                src={deepLogo}
            />
            <Heading
                className={styles.topText}
                size="extraLarge"
            >
                Welcome to DEEP!
            </Heading>
            <Heading
                className={styles.bottomText}
                size="medium"
            >
                {_ts('explore.login', 'deepSubText')}
            </Heading>
            <Heading
                size="extraSmall"
                className={styles.exploreHeading}
            >
                Curious about the platform?
            </Heading>
            <SmartButtonLikeLink
                route={routes.explore}
                variant="tertiary"
                icons={(
                    <IoCompassOutline />
                )}
            >
                Explore DEEP
            </SmartButtonLikeLink>
        </div>
    );
}

export default WelcomeContent;
