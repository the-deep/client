import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Heading from '#dui/Heading';
import ElementFragments from '#dui/ElementFragments';

import styles from './styles.scss';

interface FullPageHeaderProps {
    className?: string;
    contentClassName?: string;
    actionsClassName?: string;
    children?: React.ReactNode;
    actions?: React.ReactNode;
    heading?: React.ReactNode;
}

function FullPageHeader(props: FullPageHeaderProps) {
    const {
        className,
        children,
        contentClassName,
        actionsClassName,
        heading,
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
                            {heading}
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

export default FullPageHeader;
