import React from 'react';
import ReactSVG from 'react-svg';
import { Link } from 'react-router-dom';

import _ts from '#ts';
import { pathNames } from '#constants';
import logo from '#resources/img/deep-logo.svg';

import styles from './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
export default class ThreeHundredThree extends React.PureComponent {
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
                    {_ts('fourHundredThree', 'message1')}
                </p>
                <Link
                    to={pathNames.homeScreen}
                    className={styles.homeScreenLink}
                >
                    {_ts('fourHundredThree', 'goToDeep')}
                </Link>
            </div>
        );
    }
}
