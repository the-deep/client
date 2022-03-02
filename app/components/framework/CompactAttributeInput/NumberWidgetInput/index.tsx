import React, { useCallback } from 'react';
import {
    NumberInput,
    NumberOutput,
    Suggestion,
} from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';
import { Error, getErrorObject } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import WidgetWrapper from '../WidgetWrapper';
import { NumberWidgetAttribute } from '#types/newEntry';

type NumberValue = NonNullable<NumberWidgetAttribute['data']>;

const numberKeySelector = (s: number) => s;
const numberLabelSelector = (s: number) => String(s);

const emptyArray: number[] = [];

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: NumberValue | null | undefined,
    error: Error<NumberValue> | undefined;
    onChange: (value: NumberValue | undefined, name: N) => void,

    disabled?: boolean;
    readOnly?: boolean;
    actions?: React.ReactNode;
    icons?: React.ReactNode;
    widgetHints?: number[];
}

function NumberWidgetInput<N extends string>(props: Props<N>) {
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
        widgetHints,
    } = props;

    const error = getErrorObject(riskyError);

    const onChange = useCallback(
        (val: NumberValue['value'] | undefined, inputName: N) => {
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
            disabled={disabled}
            readOnly={readOnly}
            actions={actions}
            icons={icons}
        >
            {readOnly ? (
                <NumberOutput
                    value={value?.value}
                />
            ) : (
                <>
                    <NonFieldError
                        error={error}
                    />
                    <NumberInput
                        name={name}
                        onChange={onChange}
                        value={value?.value}
                        readOnly={readOnly}
                        disabled={disabled}
                        inputDescription={(
                            <Suggestion
                                name={name}
                                value={value?.value}
                                options={widgetHints ?? emptyArray}
                                keySelector={numberKeySelector}
                                labelSelector={numberLabelSelector}
                                onChange={onChange}
                                disabled={readOnly || disabled}
                            />
                        )}
                        error={error?.value}
                    />
                </>
            )}
        </WidgetWrapper>
    );
}

export default NumberWidgetInput;
