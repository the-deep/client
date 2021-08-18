import React, { useMemo } from 'react';
import {
    ScaleInput,
} from '@the-deep/deep-ui';
import { PartialForm } from '@togglecorp/toggle-form';

import { sortByOrder } from '#utils/common';

import { ScaleValue, ScaleWidget } from '#types/newAnalyticalFramework';
import ListWidgetWrapper from '../../ListWidgetWrapper';

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
        onChange,
        widget,
        disabled,
        readOnly,
    } = props;

    const sortedOptions = useMemo(() => (
        sortByOrder(widget?.properties?.options)
    ), [widget?.properties?.options]);

    return (
        <ListWidgetWrapper
            className={className}
            title={title}
            disabled={disabled}
            readOnly={readOnly}
        >
            <ScaleInput
                name={name}
                options={sortedOptions}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                colorSelector={optionColorSelector}
                onChange={onChange}
                value={value ?? widget?.properties?.defaultValue}
                readOnly={readOnly}
                disabled={disabled}
            />
        </ListWidgetWrapper>
    );
}

export default ScaleWidgetInput;
