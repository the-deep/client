import React from 'react';
import { reverseRoute } from '@togglecorp/fujs';
import { connect } from 'react-redux';

import Page from '#rscv/Page';
import Icon from '#rscg/Icon';
import { Redirect } from 'react-router-dom';

import {
    activeUserSelector,
} from '#redux';

import {
    User,
    AppState,
} from '#typings';

import { envText } from '#config/env';
import _ts from '#ts';
import { pathNames } from '#constants';
import featuresMapping from '#constants/features';

import styles from './styles.scss';

interface ComponentProps {
    activeUser: User;
}

const mapStateToProps = (state: AppState) => ({
    activeUser: activeUserSelector(state),
});

function Dashboard(props: ComponentProps) {
    const {
        activeUser: {
            accessibleFeatures = [],
        },
    } = props;

    const accessNewUi = accessibleFeatures.find(f => f.key === featuresMapping.newUi);
    if (accessNewUi) {
        const routeTo = reverseRoute(pathNames.home, {});
        return (
            <Redirect
                to={{
                    pathname: routeTo,
                }}
            />
        );
    }

    return (
        <Page
            className={styles.dashboard}
            mainContentClassName={styles.mainContent}
            mainContent={
                <>
                    <Icon
                        name="deepLogo"
                        className={styles.deepLogo}
                    />
                    <div className={styles.deepText} >
                        {_ts('dashboard', 'deepLabel')} {_ts('dashboard', envText)}
                    </div>
                </>
            }
        />
    );
}

export default connect(mapStateToProps)(Dashboard);
