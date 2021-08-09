import React, { useMemo } from 'react';
import {
    MultiSelectInput,
} from '@the-deep/deep-ui';
import { PartialForm } from '@togglecorp/toggle-form';

import { sortByOrder } from '#utils/common';

import { MultiSelectValue, MultiSelectWidget } from '#types/newAnalyticalFramework';
import ListWidgetWrapper from '../../ListWidgetWrapper';

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

    disabled?: boolean;
    readOnly?: boolean;

    widget: PartialMultiSelectWidget,
}

function MultiSelectWidgetInput<N extends string>(props: Props<N>) {
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
        sortByOrder(widget?.data?.options)
    ), [widget?.data?.options]);

    return (
        <ListWidgetWrapper
            className={className}
            title={title}
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
        </ListWidgetWrapper>
    );
}

export default MultiSelectWidgetInput;
