import React, { useCallback } from 'react';
import { TextArea } from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';
import { Error, getErrorObject } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { TextWidgetAttribute } from '#types/newEntry';
import WidgetWrapper from '../WidgetWrapper';

type TextValue = NonNullable<TextWidgetAttribute['data']>;

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: TextValue | null | undefined,
    error: Error<TextValue> | undefined;
    onChange: (value: TextValue | undefined, name: N) => void,

    disabled?: boolean;
    readOnly?: boolean;
    actions?: React.ReactNode;
    icons?: React.ReactNode;
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
        icons,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);

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
            error={error}
            readOnly={readOnly}
            actions={actions}
            icons={icons}
        >
            {readOnly ? (
                <div>
                    {value?.value ?? '-'}
                </div>
            ) : (
                <>
                    <NonFieldError
                        error={error}
                    />
                    <TextArea
                        name={name}
                        onChange={onChange}
                        value={value?.value}
                        rows={3}
                        readOnly={readOnly}
                        disabled={disabled}
                        error={error?.value}
                        autoSize
                    />
                </>
            )}
        </WidgetWrapper>
    );
}

export default TextWidgetInput;
