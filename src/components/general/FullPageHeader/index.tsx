import React from 'react';
import { connect } from 'react-redux';

import { _cs } from '@togglecorp/fujs';
import Icon from '#rscg/Icon';
import Heading from '#dui/Heading';
import ElementFragments from '#dui/ElementFragments';

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
            <ElementFragments
                icons={(
                    <>
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
                    </>
                )}
                iconsClassName={styles.projectDetailsContainer}
                actions={actions}
                actionsClassName={_cs(styles.actions, actionsClassName)}
                childrenClassName={_cs(styles.content, contentClassName)}
            >
                {children}
            </ElementFragments>
        </div>
    );
}

export default connect(mapStateToProps)(FullPageHeader);
