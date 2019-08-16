import React from 'react';

import _ts from '#ts';
import Page from '#rscv/Page';
import Icon from '#rscg/Icon';

import BackLink from '#components/general/BackLink';
import { pathNames } from '#constants';

import styles from './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
export default class FourHundredFour extends React.PureComponent {
    render() {
        return (
            <Page
                mainContentClassName={styles.fourHundredFour}
                mainContent={
                    <React.Fragment>
                        <Icon
                            className={styles.deepLogo}
                            name="deepLogo"
                        />
                        <h1 className={styles.heading}>
                            {_ts('fourHundredFour', 'errorFourHundredFour')}
                        </h1>
                        <p className={styles.message}>
                            <strong>{_ts('fourHundredFour', 'message1')}</strong>
                            <br />
                            {_ts('fourHundredFour', 'message2')}
                        </p>
                        <BackLink
                            defaultLink={pathNames.homeScreen}
                            className={styles.homeScreenLink}
                        >
                            {_ts('fourHundredFour', 'backToDeep')}
                        </BackLink>
                    </React.Fragment>
                }
            />
        );
    }
}
