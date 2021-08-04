import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ElementFragments,
    Heading,
    Border,
} from '@the-deep/deep-ui';

// import Svg from '#newComponents/Svg';
// import newDeepLogo from '#resources/img/deep-logo-new.svg';

import styles from './styles.css';

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
        <div
            className={_cs(styles.fullPageHeader, className)}
        >
            <ElementFragments
                actions={actions}
                iconsContainerClassName={styles.icons}
                childrenContainerClassName={styles.content}
                icons={(
                    <>
                        <Heading>
                            {heading}
                        </Heading>
                        <div className={styles.descriptionContainer}>
                            <div className={styles.description}>
                                {description}
                            </div>
                        </div>
                    </>
                /*
                    <div className={styles.iconWrapper}>
                        <Svg
                            className={styles.icon}
                            src={newDeepLogo}
                        />
                    </div>
                 */
                )}
            >
                {children}
            </ElementFragments>
            <Border />
        </div>
    );
}

export default FullPageHeader;
