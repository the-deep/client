import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Heading,
    Border,
} from '@the-deep/deep-ui';

import Svg from '#components/Svg';
import deepLogo from '#resources/img/deep-logo-new.svg';

import styles from './styles.css';

// FIXME: this should be obsolete

interface FullPageHeaderProps {
    className?: string;
    children?: React.ReactNode;
    actions?: React.ReactNode;
    heading?: React.ReactNode;
    description?: React.ReactNode;
}

function FullPageHeader(props: FullPageHeaderProps) {
    const {
        className,
        children,
        heading,
        actions,
        description,
    } = props;

    return (
        <div className={_cs(styles.fullPageHeader, className)}>
            <div className={styles.headingSection}>
                <div className={styles.appBrand}>
                    <Svg
                        className={styles.logo}
                        src={deepLogo}
                    />
                </div>
                <div className={styles.headingContainer}>
                    <Heading
                        size="medium"
                        className={styles.heading}
                    >
                        {heading}
                    </Heading>
                </div>
                {description && (
                    <div className={styles.descriptionContainer}>
                        <div className={styles.description}>
                            {description}
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.menuSection}>
                {children}
            </div>
            <div className={styles.actionsSection}>
                {actions}
            </div>
            <Border width="thin" />
        </div>
    );
}

export default FullPageHeader;
