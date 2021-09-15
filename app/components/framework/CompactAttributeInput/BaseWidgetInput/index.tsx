import React from 'react';
import { Card } from '@the-deep/deep-ui';

import WidgetWrapper from '../WidgetWrapper';

export interface Props{
    title: string | undefined;
    className?: string;
    error?: unknown;
}

function BaseWidgetInput(props: Props) {
    const {
        className,
        title,
        error,
    } = props;

    return (
        <WidgetWrapper
            className={className}
            title={title}
            error={error}
        >
            <Card>
                {/* FIXME: use strings */}
                The widget is not yet implemented!
            </Card>
        </WidgetWrapper>
    );
}

export default BaseWidgetInput;
