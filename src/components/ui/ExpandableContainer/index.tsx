import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import { useModalState } from '#hooks/stateManagement';
import Button from '#rsca/Button';
import Icon from '#rscg/Icon';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
    contentClassName?: string;
    headerClassName?: string;
    headingClassName?: string;
    heading?: React.ReactNode;
    children: React.ReactNode;
    defaultVisibility?: boolean;
    mount?: boolean;
}

function ExpandableContainer(props: ComponentProps) {
    const {
        className,
        contentClassName,
        headingClassName,
        headerClassName,
        heading,
        children,
        defaultVisibility = false,
        mount = true,
    } = props;

    const [
        showContent,
        setContentVisible,
        setContentHidden,
    ] = useModalState(defaultVisibility);

    const mountContent = useMemo(() => (
        mount ? true : showContent
    ), [mount, showContent]);

    return (
        <div className={_cs(className, styles.expandableContainer)}>
            <Button
                className={_cs(styles.sectionHeader, headerClassName)}
                transparent
                onClick={
                    showContent ? setContentHidden : setContentVisible
                }
            >
                <div className={_cs(styles.heading, headingClassName)}>
                    {heading}
                </div>
                <Icon
                    className={styles.icon}
                    name={showContent ? 'chevronUp' : 'chevronDown'}
                />
            </Button>
            {mountContent && (
                <div
                    className={_cs(
                        contentClassName,
                        styles.content,
                        showContent && styles.visible,
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

export default ExpandableContainer;
