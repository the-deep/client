import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Actions from '#components/ui/Actions';
import Heading from '#components/ui/Heading';
import Icons from '#components/ui/Icons';

import styles from './styles.scss';

interface Props {
    className?: string;
    headingClassName?: string;
    descriptionClassName?: string;
    headingContainerClassName?: string;
    iconsClassName?: string;
    actionsClassName?: string;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    headingSize?: 'extraSmall' | 'small' | 'medium' | 'large';
}

function Header(props: Props) {
    const {
        className,
        headingClassName,
        descriptionClassName,
        iconsClassName,
        headingContainerClassName,
        actionsClassName,
        heading,
        description,
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
            <div className={_cs(styles.midContainer, headingContainerClassName)}>
                <Heading
                    size={headingSize}
                    className={_cs(styles.heading, headingClassName)}
                >
                    { heading }
                </Heading>
                <div className={_cs(styles.description, descriptionClassName)}>
                    {description}
                </div>
            </div>
            { actions && (
                <Actions className={_cs(styles.actions, actionsClassName)}>
                    { actions }
                </Actions>
            )}
        </div>
    );
}

export default Header;
