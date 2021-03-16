import React from 'react';
import { connect } from 'react-redux';

import { _cs } from '@togglecorp/fujs';
import Icon from '#rscg/Icon';
import Heading from '#dui/Heading';
import _ts from '#ts';

import {
    activeProjectFromStateSelector,
} from '#redux';

import {
    ProjectDetails,
    AppState,
} from '#typings';

import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    activeProject: activeProjectFromStateSelector(state),
});

interface FullPageHeaderProps {
    className?: string;
    contentClassName?: string;
    actionsClassName?: string;
    children?: React.ReactNode;
    actions?: React.ReactNode;
    activeProject: ProjectDetails;
}

function FullPageHeader(props: FullPageHeaderProps) {
    const {
        className,
        children,
        contentClassName,
        actionsClassName,
        activeProject,
        actions,
    } = props;

    return (
        <div className={_cs(styles.fullPageHeader, className)}>
            <div className={styles.projectDetailsContainer}>
                <div className={styles.iconWrapper}>
                    <Icon
                        className={styles.icon}
                        name="newDeepLogo"
                    />
                </div>
                <Heading
                    size="medium"
                    className={styles.projectTitleContainer}
                >
                    {activeProject?.title}
                </Heading>
            </div>
            <div className={_cs(styles.content, contentClassName)}>
                {children}
            </div>
            <div className={_cs(styles.actions, actionsClassName)}>
                {actions}
            </div>
        </div>
    );
}

export default connect(mapStateToProps)(FullPageHeader);
