import React from 'react';
import { TextArea } from '@the-deep/deep-ui';

import WidgetWrapper from '../../Widget';
import { TextValue } from '../../types';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: TextValue | null | undefined,
    onChange: (value: TextValue | undefined, name: N) => void,

    actions?: React.ReactNode,
    disabled?: boolean;
    readOnly?: boolean;
}

function TextWidgetInput<N extends string>(props: Props<N>) {
    const {
        className,
        title,
        name,
        value,
        onChange,
        disabled,
        readOnly,
        actions,
    } = props;

    return (
        <WidgetWrapper
            className={className}
            title={title}
            actions={actions}
        >
            <TextArea
                name={name}
                onChange={onChange}
                value={value}
                rows={5}
                readOnly={readOnly}
                disabled={disabled}
            />
        </WidgetWrapper>
    );
}

export default TextWidgetInput;
