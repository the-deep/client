import React from 'react';
import { TextArea } from '@the-deep/deep-ui';

import { TextValue } from '#types/newAnalyticalFramework';
import ListWidgetWrapper from '../ListWidgetWrapper';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: TextValue | null | undefined,
    onChange: (value: TextValue | undefined, name: N) => void,

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
    } = props;

    return (
        <ListWidgetWrapper
            className={className}
            title={title}
            disabled={disabled}
            readOnly={readOnly}
        >
            {readOnly ? (
                <div>
                    {value}
                </div>
            ) : (
                <TextArea
                    name={name}
                    onChange={onChange}
                    value={value}
                    rows={3}
                    readOnly={readOnly}
                    disabled={disabled}
                />
            )}
        </ListWidgetWrapper>
    );
}

export default TextWidgetInput;
