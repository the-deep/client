import React, { useMemo } from 'react';
import {
    SelectInput,
} from '@the-deep/deep-ui';
import { PartialForm } from '@togglecorp/toggle-form';

import { sortByOrder } from '#utils/common';

import { SingleSelectValue, SingleSelectWidget } from '#types/newAnalyticalFramework';
import ListWidgetWrapper from '../../ListWidgetWrapper';

export type PartialSingleSelectWidget = PartialForm<
    SingleSelectWidget,
    'clientId' | 'type' | 'order'
>;

type Option = NonNullable<NonNullable<
    NonNullable<PartialSingleSelectWidget>['data']
>['options']>[number];

const optionKeySelector = (option: Option) => option.clientId;
const optionLabelSelector = (option: Option) => option.label ?? 'Unnamed';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: SingleSelectValue | null | undefined,
    onChange: (value: SingleSelectValue | undefined, name: N) => void,

    disabled?: boolean;
    readOnly?: boolean;

    widget: PartialSingleSelectWidget,
}

function SingleSelectWidgetInput<N extends string>(props: Props<N>) {
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

    const widgetOptions = widget?.data?.options;
    const sortedOptions = useMemo(() => (
        sortByOrder(widgetOptions)
    ), [widgetOptions]);

    const selectedValue = useMemo(() => (
        widgetOptions?.find((o) => o.clientId === value)?.label
    ), [widgetOptions, value]);

    return (
        <ListWidgetWrapper
            className={className}
            title={title}
            disabled={disabled}
            readOnly={readOnly}
        >
            {readOnly ? (
                <div>
                    {selectedValue}
                </div>
            ) : (
                <SelectInput
                    name={name}
                    options={sortedOptions}
                    keySelector={optionKeySelector}
                    labelSelector={optionLabelSelector}
                    onChange={onChange}
                    value={value}
                    readOnly={readOnly}
                    disabled={disabled}
                />
            )}
        </ListWidgetWrapper>
    );
}

export default SingleSelectWidgetInput;
