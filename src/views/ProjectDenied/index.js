import React from 'react';
import ReactSVG from 'react-svg';

import _ts from '#ts';
import logo from '#resources/img/deep-logo.svg';

import styles from './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
export default class ProjectDenied extends React.PureComponent {
    render() {
        return (
            <div className={styles.projectDenied}>
                <ReactSVG
                    svgClassName={styles.deepLogo}
                    path={logo}
                />
                <h1 className={styles.heading}>
                    {_ts('projectDenied', 'errorThreeHundredThree')}
                </h1>
                <p className={styles.message}>
                    {_ts('projectDenied', 'message1')}
                </p>
            </div>
        );
    }
}
