import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Header from '#dui/Header';
import Footer from '#dui/Footer';

import styles from './styles.scss';

export interface ContainerProps {
    className?: string;
    heading?: React.ReactNode;
    headerIcons?: React.ReactNode;
    headerActions?: React.ReactNode;
    headerDescription?: React.ReactNode;
    headerClassName?: string;
    headerDescriptionClassName?: string;
    headingClassName?: string;
    children?: React.ReactNode;
    contentClassName?: string;
    footerContent?: React.ReactNode;
    footerActions?: React.ReactNode;

    // Is sub container? (i.e. Container with small heading)
    sub?: boolean;
}

function Container(props: ContainerProps) {
    const {
        className,
        heading,
        children,
        headerActions,
        headerIcons,
        headerDescription,
        headerDescriptionClassName,
        headerClassName,
        headingClassName,
        contentClassName,
        footerContent,
        footerActions,
        sub = false,
    } = props;

    return (
        <div className={_cs(styles.container, className)}>
            {(heading || headerActions || headerIcons) && (
                <Header
                    icons={headerIcons}
                    actions={headerActions}
                    className={_cs(styles.header, headerClassName)}
                    heading={heading}
                    headingSize={sub ? 'medium' : 'large'}
                    description={headerDescription}
                    descriptionClassName={headerDescriptionClassName}
                    headingClassName={headingClassName}
                />
            )}
            <div className={_cs(styles.content, contentClassName)}>
                { children }
            </div>
            {(footerContent || footerActions) && (
                <Footer
                    actions={footerActions}
                    className={styles.footer}
                >
                    { footerContent }
                </Footer>
            )}
        </div>
    );
}

export default Container;
