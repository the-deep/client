import React from 'react';
import ReactSVG from 'react-svg';

import _ts from '#ts';
import BackLink from '#components/BackLink';
import { pathNames } from '#constants';
import logo from '#resources/img/deep-logo.svg';

import styles from './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
export default class FourHundredFour extends React.PureComponent {
    render() {
        return (
            <div className={styles.fourHundredFour}>
                <ReactSVG
                    svgClassName={styles.deepLogo}
                    path={logo}
                />
                <h1 className={styles.heading}>
                    {_ts('fourHundredFour', 'errorFourHundredFour')}
                </h1>
                <p className={styles.message}>
                    {_ts('fourHundredFour', 'message1')}
                    <br />
                    {_ts('fourHundredFour', 'message2')}
                </p>
                <BackLink
                    defaultLink={pathNames.homeScreen}
                    className={styles.homeScreenLink}
                >
                    {_ts('fourHundredFour', 'backToDeep')}
                </BackLink>
            </div>
        );
    }
}
