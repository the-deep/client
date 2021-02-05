import React from 'react';

import Page from '#rscv/Page';
import Icon from '#rscg/Icon';
import { Redirect } from 'react-router-dom';

import { envText } from '#config/env';
import _ts from '#ts';

import styles from './styles.scss';


function Dashboard() {
    return (
        <Page
            className={styles.dashboard}
            mainContentClassName={styles.mainContent}
            mainContent={
                <React.Fragment>
                    <Icon
                        name="deepLogo"
                        className={styles.deepLogo}
                    />
                    <div className={styles.deepText} >
                        {_ts('dashboard', 'deepLabel')} {_ts('dashboard', envText)}
                    </div>
                </React.Fragment>
            }
        />
    );
}

export default Dashboard;
