import React from 'react';
import { Card } from '@the-deep/deep-ui';

import WidgetWrapper from '../WidgetWrapper';

export interface Props{
    title: string | undefined;
    className?: string;
    actions?: React.ReactNode,
    icons?: React.ReactNode,
}

function BaseWidgetInput(props: Props) {
    const {
        className,
        title,
        actions,
        icons,
    } = props;

    return (
        <WidgetWrapper
            className={className}
            title={title}
            actions={actions}
            icons={icons}
        >
            <Card>
                {/* FIXME: use strings */}
                The widget is not yet implemented!
            </Card>
        </WidgetWrapper>
    );
}

export default BaseWidgetInput;
