import React from 'react';
import { DateInput } from '@the-deep/deep-ui';

import { NodeRef } from '#components/ui/SortableList';

import WidgetWrapper from '../../Widget';
import { DateValue } from '../../types';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: DateValue | null | undefined,
    onChange: (value: DateValue | undefined, name: N) => void,

    actions?: React.ReactNode,
    disabled?: boolean;
    readOnly?: boolean;

    nodeRef?: NodeRef;
    rootStyle?: React.CSSProperties;
}

function DateWidgetInput<N extends string>(props: Props<N>) {
    const {
        className,
        title,
        name,
        value,
        onChange,
        disabled,
        readOnly,
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
            <DateInput
                name={name}
                onChange={onChange}
                value={value}
                readOnly={readOnly}
                disabled={disabled}
            />
        </WidgetWrapper>
    );
}

export default DateWidgetInput;
