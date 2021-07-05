import React from 'react';
import { Card } from '@the-deep/deep-ui';

import { NodeRef } from '#components/ui/SortableList';

import WidgetWrapper from '../../Widget';

export interface Props{
    title: string | undefined;
    className?: string;
    actions?: React.ReactNode,

    nodeRef?: NodeRef;
    rootStyle?: React.CSSProperties;
}

function BaseWidgetInput(props: Props) {
    const {
        className,
        title,
        actions,
        nodeRef,
        rootStyle,
    } = props;

    return (
        <WidgetWrapper
            className={className}
            title={title}
            actions={actions}
            nodeRef={nodeRef}
            rootStyle={rootStyle}
        >
            <Card>
                {/* FIXME: use strings */}
                The widget is not yet implemented!
            </Card>
        </WidgetWrapper>
    );
}

export default BaseWidgetInput;
