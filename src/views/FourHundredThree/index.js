import React from 'react';
import ReactSVG from 'react-svg';

import _ts from '#ts';
import BackLink from '#components/general/BackLink';
import { pathNames } from '#constants';
import logo from '#resources/img/deep-logo.svg';

import styles from './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
export default class FourHundredThree extends React.PureComponent {
    render() {
        return (
            <div className={styles.fourHundredThree}>
                <ReactSVG
                    svgClassName={styles.deepLogo}
                    path={logo}
                />
                <h1 className={styles.heading}>
                    {_ts('fourHundredThree', 'errorThreeHundredThree')}
                </h1>
                <p className={styles.message}>
                    <strong>{_ts('fourHundredThree', 'message1')}</strong>
                    <br />
                    {_ts('fourHundredThree', 'message2')}
                </p>
                <BackLink
                    defaultLink={pathNames.homeScreen}
                    className={styles.homeScreenLink}
                >
                    {_ts('fourHundredThree', 'backToDeep')}
                </BackLink>
            </div>
        );
    }
}
