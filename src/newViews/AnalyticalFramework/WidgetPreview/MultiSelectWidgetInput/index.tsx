import React, { useMemo } from 'react';
import {
    MultiSelectInput,
} from '@the-deep/deep-ui';
import { PartialForm } from '@togglecorp/toggle-form';

import { NodeRef } from '#newComponents/ui/SortableList';
import { sortByOrder } from '#utils/safeCommon';

import { MultiSelectValue, MultiSelectWidget } from '../../types';
import WidgetWrapper from '../../Widget';

export type PartialMultiSelectWidget = PartialForm<
    MultiSelectWidget,
    'clientId' | 'type' | 'order'
>;

type Option = NonNullable<NonNullable<
    NonNullable<PartialMultiSelectWidget>['data']
>['options']>[number];

const optionKeySelector = (option: Option) => option.clientId;
const optionLabelSelector = (option: Option) => option.label ?? 'Unnamed';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: MultiSelectValue | null | undefined,
    onChange: (value: MultiSelectValue | undefined, name: N) => void,

    actions?: React.ReactNode,
    disabled?: boolean;
    readOnly?: boolean;

    widget: PartialMultiSelectWidget,

    nodeRef?: NodeRef;
    rootStyle?: React.CSSProperties;
}

function MultiSelectWidgetInput<N extends string>(props: Props<N>) {
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

    const sortedOptions = useMemo(() => (
        sortByOrder(widget?.data?.options)
    ), [widget?.data?.options]);

    return (
        <WidgetWrapper
            className={className}
            title={title}
            actions={actions}
            nodeRef={nodeRef}
            rootStyle={rootStyle}
        >
            <MultiSelectInput
                name={name}
                options={sortedOptions}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                onChange={onChange}
                value={value}
                readOnly={readOnly}
                disabled={disabled}
            />
        </WidgetWrapper>
    );
}

export default MultiSelectWidgetInput;
