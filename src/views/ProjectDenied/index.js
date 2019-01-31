import React, { Fragment } from 'react';
import ReactSVG from 'react-svg';

import Page from '#rscv/Page';
import _ts from '#ts';
import logo from '#resources/img/deep-logo.svg';

import styles from './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
export default class ProjectDenied extends React.PureComponent {
    render() {
        return (
            <Page
                mainContentClassName={styles.projectDenied}
                mainContent={
                    <Fragment>
                        <ReactSVG
                            svgClassName={styles.deepLogo}
                            path={logo}
                        />
                        <h1 className={styles.heading}>
                            {_ts('projectDenied', 'errorThreeHundredThree')}
                        </h1>
                        <p className={styles.message}>
                            <strong>{_ts('projectDenied', 'message1')}</strong>
                            <br />
                            {_ts('projectDenied', 'message2')}
                        </p>
                    </Fragment>
                }
            />
        );
    }
}
