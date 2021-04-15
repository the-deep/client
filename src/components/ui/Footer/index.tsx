import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { Actions } from '@the-deep/deep-ui';

interface Props {
    className?: string;
    actionsContainerClassName?: string;
    actions?: React.ReactNode;
    children?: React.ReactNode;
    contentClassName?: string;
}

function Footer(props: Props) {
    const {
        className,
        actionsContainerClassName,
        actions,
        contentClassName,
        children,
    } = props;

    return (
        <div className={_cs(className)}>
            <div className={_cs(contentClassName)}>
                { children }
            </div>
            { actions && (
                <Actions className={_cs(actionsContainerClassName)}>
                    { actions }
                </Actions>
            )}
        </div>
    );
}

export default Footer;
