import React, { useMemo, useCallback } from 'react';
import {
    ScaleInput,
} from '@the-deep/deep-ui';
import { PartialForm, Error, getErrorObject } from '@togglecorp/toggle-form';
import { isNotDefined } from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import { sortByOrder } from '#utils/common';

import { ScaleWidget } from '#types/newAnalyticalFramework';
import { ScaleWidgetAttribute } from '#types/newEntry';
import WidgetWrapper from '../WidgetWrapper';

type ScaleValue = NonNullable<ScaleWidgetAttribute['data']>;

export type PartialScaleWidget = PartialForm<
    ScaleWidget,
    'key' | 'widgetId' | 'order' | 'conditional'
>;

type Option = NonNullable<NonNullable<
    NonNullable<PartialScaleWidget>['properties']
>['options']>[number];

const optionKeySelector = (option: Option) => option.key;
const optionLabelSelector = (option: Option) => option.label ?? 'Unnamed';
const optionColorSelector = (option: Option) => option.color ?? '#414141';

export interface Props<N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: ScaleValue | null | undefined,
    error: Error<ScaleValue> | undefined;
    onChange: (value: ScaleValue | undefined, name: N) => void,

    actions?: React.ReactNode,
    disabled?: boolean;
    readOnly?: boolean;

    widget: PartialScaleWidget,
}

function ScaleWidgetInput<N extends string>(props: Props<N>) {
    const {
        className,
        title,
        name,
        value,
        onChange: onChangeFromProps,
        actions,
        widget,
        disabled,
        readOnly,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);

    const sortedOptions = useMemo(() => (
        sortByOrder(widget?.properties?.options)
    ), [widget?.properties?.options]);

    const onChange = useCallback(
        (val: ScaleValue['value'] | undefined, inputName: N) => {
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
            error={error}
        >
            <NonFieldError
                error={error}
            />
            <ScaleInput
                name={name}
                options={sortedOptions}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                colorSelector={optionColorSelector}
                onChange={onChange}
                value={value?.value ?? widget?.properties?.defaultValue}
                readOnly={readOnly}
                disabled={disabled}
                error={error?.value}
            />
        </WidgetWrapper>
    );
}

export default ScaleWidgetInput;
