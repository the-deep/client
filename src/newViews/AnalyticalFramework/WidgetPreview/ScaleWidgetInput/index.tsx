import React from 'react';
import {
    ScaleInput,
} from '@the-deep/deep-ui';

import { NodeRef } from '#components/ui/SortableList';

import { ScaleValue, ScaleWidget, PartialForm } from '../../types';
import WidgetWrapper from '../../Widget';

export type PartialScaleWidget = PartialForm<
    ScaleWidget,
    'clientId' | 'type'
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

    nodeRef?: NodeRef;
    rootStyle?: React.CSSProperties;
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
            <ScaleInput
                name={name}
                options={widget?.data?.options}
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
