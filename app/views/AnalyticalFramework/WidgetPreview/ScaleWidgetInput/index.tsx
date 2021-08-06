import React, { useMemo } from 'react';
import {
    ScaleInput,
} from '@the-deep/deep-ui';
import { PartialForm } from '@togglecorp/toggle-form';

import { sortByOrder } from '#utils/common';

import { ScaleValue, ScaleWidget } from '#types/newAnalyticalFramework';
import WidgetWrapper from '../../Widget';

export type PartialScaleWidget = PartialForm<
    ScaleWidget,
    'clientId' | 'type' | 'order'
>;

type Option = NonNullable<NonNullable<
    NonNullable<PartialScaleWidget>['data']
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
        onChange,
        actions,
        widget,
        disabled,
        readOnly,
    } = props;

    const sortedOptions = useMemo(() => (
        sortByOrder(widget?.data?.options)
    ), [widget?.data?.options]);

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
                value={value ?? widget?.data?.defaultValue}
                readOnly={readOnly}
                disabled={disabled}
            />
        </WidgetWrapper>
    );
}

export default ScaleWidgetInput;
