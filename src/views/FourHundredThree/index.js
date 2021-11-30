import React from 'react';

import _ts from '#ts';
import Page from '#rscv/Page';
import Icon from '#rscg/Icon';

import styles from './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
export default class FourHundredThree extends React.PureComponent {
    render() {
        return (
            <Page
                mainContentClassName={styles.fourHundredThree}
                mainContent={
                    <React.Fragment>
                        <Icon
                            className={styles.deepLogo}
                            name="deepLogo"
                        />
                        <h1 className={styles.heading}>
                            {_ts('fourHundredThree', 'errorThreeHundredThree')}
                        </h1>
                        <p className={styles.message}>
                            <strong>{_ts('fourHundredThree', 'message1')}</strong>
                            <br />
                            {_ts('fourHundredThree', 'message2')}
                        </p>
                    </React.Fragment>
                }
            />
        );
    }
}
