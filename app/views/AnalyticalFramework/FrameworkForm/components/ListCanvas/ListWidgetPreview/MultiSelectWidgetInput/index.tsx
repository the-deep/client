import React, { useMemo } from 'react';
import {
    listToMap,
} from '@togglecorp/fujs';
import {
    MultiSelectInput,
} from '@the-deep/deep-ui';
import { PartialForm } from '@togglecorp/toggle-form';

import { sortByOrder } from '#utils/common';

import { MultiSelectValue, MultiSelectWidget } from '#types/newAnalyticalFramework';
import ListWidgetWrapper from '../../ListWidgetWrapper';

export type PartialMultiSelectWidget = PartialForm<
    MultiSelectWidget,
    'clientId' | 'key' | 'widgetId' | 'order'
>;

type Option = NonNullable<NonNullable<
    NonNullable<PartialMultiSelectWidget>['properties']
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

    const widgetOptions = widget?.properties?.options;
    const sortedOptions = useMemo(() => (
        sortByOrder(widgetOptions)
    ), [widgetOptions]);

    const selectedValues = useMemo(() => {
        const optionsMap = listToMap(widgetOptions, (d) => d.clientId, (d) => d.label);
        return value?.map((v) => optionsMap?.[v])?.join(', ');
    }, [widgetOptions, value]);

    return (
        <ListWidgetWrapper
            className={className}
            title={title}
            disabled={disabled}
            readOnly={readOnly}
        >
            {readOnly ? (
                <div>
                    {selectedValues}
                </div>
            ) : (
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
            )}
        </ListWidgetWrapper>
    );
}

export default MultiSelectWidgetInput;
