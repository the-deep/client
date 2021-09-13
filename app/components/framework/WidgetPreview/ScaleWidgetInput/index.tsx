import React, { useMemo, useCallback } from 'react';
import {
    ScaleInput,
} from '@the-deep/deep-ui';
import { PartialForm } from '@togglecorp/toggle-form';
import { isNotDefined } from '@togglecorp/fujs';

import { sortByOrder } from '#utils/common';

import { ScaleWidget } from '#types/newAnalyticalFramework';
import { ScaleWidgetAttribute } from '#types/newEntry';
import WidgetWrapper from '../WidgetWrapper';

type ScaleValue = NonNullable<ScaleWidgetAttribute['data']>;

export type PartialScaleWidget = PartialForm<
    ScaleWidget,
    'clientId' | 'key' | 'widgetId' | 'order'
>;

type Option = NonNullable<NonNullable<
    NonNullable<PartialScaleWidget>['properties']
>['options']>[number];

const optionKeySelector = (option: Option) => option.clientId;
const optionLabelSelector = (option: Option) => option.label ?? 'Unnamed';
const optionColorSelector = (option: Option) => option.color ?? '#414141';

export interface Props<N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: ScaleValue | null | undefined,
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
    } = props;

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
        >
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
            />
        </WidgetWrapper>
    );
}

export default ScaleWidgetInput;
