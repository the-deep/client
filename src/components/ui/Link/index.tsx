import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Link as RouterLink,
    LinkProps as RouterLinkProps,
} from 'react-router-dom';

import styles from './styles.scss';

export interface LinkProps extends RouterLinkProps {
    className?: string;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    iconsClassName?: string;
    linkElementClassName?: string;
    actionsClassName?: string;
    disabled?: boolean;
}

function Link(props: LinkProps) {
    const {
        disabled,
        className,
        actionsClassName,
        iconsClassName,
        linkElementClassName,
        icons,
        actions,
        ...otherProps
    } = props;

    return (
        <div className={_cs(className, styles.link, disabled && styles.disabled)}>
            {icons && (
                <div className={_cs(iconsClassName, styles.icons)}>
                    { icons }
                </div>
            )}
            <RouterLink
                className={_cs(linkElementClassName, styles.linkElement)}
                {...otherProps}
            />
            {actions && (
                <div className={_cs(actionsClassName, styles.actions)}>
                    { actions }
                </div>
            )}
        </div>
    );
}

export default Link;
