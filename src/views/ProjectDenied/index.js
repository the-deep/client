import React, { Fragment } from 'react';

import Page from '#rscv/Page';
import Icon from '#rscg/Icon';
import _ts from '#ts';

import styles from './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
export default class ProjectDenied extends React.PureComponent {
    render() {
        return (
            <Page
                mainContentClassName={styles.projectDenied}
                mainContent={
                    <Fragment>
                        <Icon
                            className={styles.deepLogo}
                            name="deepLogo"
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
