import React from 'react';
import { Card } from '@the-deep/deep-ui';

import WidgetWrapper from '../WidgetWrapper';

export interface Props{
    title: string | undefined;
    className?: string;
}

function BaseWidgetInput(props: Props) {
    const {
        className,
        title,
    } = props;

    return (
        <WidgetWrapper
            className={className}
            title={title}
        >
            <Card>
                {/* FIXME: use strings */}
                The widget is not yet implemented!
            </Card>
        </WidgetWrapper>
    );
}

export default BaseWidgetInput;
