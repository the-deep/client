import React from 'react';
import { Card } from '@the-deep/deep-ui';

import WidgetWrapper from '../WidgetWrapper';

export interface Props{
    title: string | undefined;
    className?: string;
    error?: unknown;
    disabled?: boolean;
    readOnly?: boolean;
    actions?: React.ReactNode;
    icons?: React.ReactNode;
}

function BaseWidgetInput(props: Props) {
    const {
        className,
        title,
        error,
        disabled,
        readOnly,
        actions,
        icons,
    } = props;

    return (
        <WidgetWrapper
            className={className}
            title={title}
            error={error}
            disabled={disabled}
            readOnly={readOnly}
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
