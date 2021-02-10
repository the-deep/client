import React from 'react';
import {
    _cs,
    isValidUrl,
} from '@togglecorp/fujs';
import {
    Link as RouterLink,
    LinkProps as RouterLinkProps,
} from 'react-router-dom';

import Icon from '#rscg/Icon';

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
        to,
        ...otherProps
    } = props;

    const isExternalLink = React.useMemo(() => isValidUrl(to as string), [to]);

    return (
        <div className={_cs(className, styles.link, disabled && styles.disabled)}>
            {icons && (
                <div className={_cs(iconsClassName, styles.icons)}>
                    { icons }
                </div>
            )}
            { isExternalLink ? (
                // eslint-disable-next-line jsx-a11y/anchor-has-content
                <a
                    href={to as string}
                    className={_cs(linkElementClassName, styles.linkElement)}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...otherProps}
                />
            ) : (
                <RouterLink
                    to={to}
                    className={_cs(linkElementClassName, styles.linkElement)}
                    {...otherProps}
                />
            )}
            {(actions || isExternalLink) && (
                <div className={_cs(actionsClassName, styles.actions)}>
                    { actions }
                    { isExternalLink && <Icon name="chevronRight" /> }
                </div>
            )}
        </div>
    );
}

export default Link;
