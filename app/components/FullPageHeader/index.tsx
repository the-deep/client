import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Header } from '@the-deep/deep-ui';

// import Svg from '#newComponents/Svg';
// import newDeepLogo from '#resources/img/deep-logo-new.svg';

import styles from './styles.css';

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
        <Header
            className={_cs(styles.fullPageHeader, className)}
            descriptionClassName={_cs(styles.content, contentClassName)}
            headingClassName={styles.heading}
            headingSectionClassName={styles.headingSection}
            headingContainerClassName={styles.headingContainer}
            actionsContainerClassName={actionsClassName}
            inlineDescription
            /*
            icons={(
                <div className={styles.iconWrapper}>
                    <Svg
                        className={styles.icon}
                        src={newDeepLogo}
                    />
                </div>
            )}
             */
            heading={heading}
            description={children}
            actions={actions}
        />
    );
}

export default FullPageHeader;
