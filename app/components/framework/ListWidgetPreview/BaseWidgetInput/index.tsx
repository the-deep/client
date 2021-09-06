import React from 'react';
import { Card } from '@the-deep/deep-ui';

import ListWidgetWrapper from '../ListWidgetWrapper';

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
        <ListWidgetWrapper
            className={className}
            title={title}
        >
            <Card>
                {/* FIXME: use strings */}
                The widget is not yet implemented!
            </Card>
        </ListWidgetWrapper>
    );
}

export default BaseWidgetInput;
