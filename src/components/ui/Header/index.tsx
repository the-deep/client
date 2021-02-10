import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Actions from '#components/ui/Actions';
import Heading from '#components/ui/Heading';
import Icons from '#components/ui/Icons';

import styles from './styles.scss';

interface Props {
    className?: string;
    headingClassName?: string;
    iconsClassName?: string;
    actionsClassName?: string;
    heading?: React.ReactNode;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    headingSize?: 'extraSmall' | 'small' | 'medium' | 'large';
}

function Header(props: Props) {
    const {
        className,
        headingClassName,
        iconsClassName,
        actionsClassName,
        heading,
        actions,
        icons,
        headingSize,
    } = props;

    return (
        <div className={_cs(className, styles.header)}>
            { icons && (
                <Icons className={_cs(styles.icons, iconsClassName)}>
                    { icons }
                </Icons>
            )}
            <Heading
                size={headingSize}
                className={_cs(styles.heading, headingClassName)}
            >
                { heading }
            </Heading>
            { actions && (
                <Actions className={_cs(styles.actions, actionsClassName)}>
                    { actions }
                </Actions>
            )}
        </div>
    );
}

export default Header;
