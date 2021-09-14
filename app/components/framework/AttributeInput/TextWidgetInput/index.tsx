import React, { useCallback } from 'react';
import { TextArea } from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';

import { TextWidgetAttribute } from '#types/newEntry';
import WidgetWrapper from '../WidgetWrapper';

type TextValue = NonNullable<TextWidgetAttribute['data']>;

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
        onChange: onChangeFromProps,
        disabled,
        readOnly,
        actions,
    } = props;

    const onChange = useCallback(
        (val: TextValue['value'] | undefined, inputName: N) => {
            if (isNotDefined(val)) {
                onChangeFromProps(undefined, inputName);
            } else {
                onChangeFromProps({ value: val }, inputName);
            }
        },
        [onChangeFromProps],
    );

    return (
        <WidgetWrapper
            className={className}
            title={title}
            actions={actions}
        >
            <TextArea
                name={name}
                onChange={onChange}
                value={value?.value}
                rows={5}
                readOnly={readOnly}
                disabled={disabled}
            />
        </WidgetWrapper>
    );
}

export default TextWidgetInput;
