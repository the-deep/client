import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Heading,
    ElementFragments,
} from '@the-deep/deep-ui';

import Svg from '#newComponents/Svg';
import newDeepLogo from '#resources/img/deep-logo-new.svg';

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
                            <Svg
                                className={styles.icon}
                                src={newDeepLogo}
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
                iconsContainerClassName={styles.projectDetailsContainer}
                actions={actions}
                actionsContainerClassName={_cs(styles.actions, actionsClassName)}
                childrenContainerClassName={_cs(styles.content, contentClassName)}
            >
                {children}
            </ElementFragments>
        </div>
    );
}

export default FullPageHeader;
