import React, { useMemo, useCallback } from 'react';
import {
    MultiSelectInput,
} from '@the-deep/deep-ui';
import { PartialForm, Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';
import { listToMap, isNotDefined } from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import { sortByOrder } from '#utils/common';

import { MultiSelectWidget } from '#types/newAnalyticalFramework';
import { MultiSelectWidgetAttribute } from '#types/newEntry';
import WidgetWrapper from '../WidgetWrapper';

type MultiSelectValue = NonNullable<MultiSelectWidgetAttribute['data']>;

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
    error: Error<MultiSelectValue> | undefined;
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
        onChange: onChangeFromProps,
        widget,
        disabled,
        readOnly,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);

    const onChange = useCallback(
        (val: MultiSelectValue['value'] | undefined, inputName: N) => {
            if (isNotDefined(val)) {
                onChangeFromProps(undefined, inputName);
            } else {
                onChangeFromProps({ value: val }, inputName);
            }
        },
        [onChangeFromProps],
    );

    const widgetOptions = widget?.properties?.options;
    const sortedOptions = useMemo(() => (
        sortByOrder(widgetOptions)
    ), [widgetOptions]);

    const selectedValues = useMemo(() => {
        const optionsMap = listToMap(widgetOptions, (d) => d.clientId, (d) => d.label);
        return value?.value?.map((v) => optionsMap?.[v])?.join(', ');
    }, [widgetOptions, value]);

    return (
        <WidgetWrapper
            className={className}
            title={title}
            disabled={disabled}
            readOnly={readOnly}
            error={error}
        >
            {readOnly ? (
                <div>
                    {selectedValues}
                </div>
            ) : (
                <>
                    <NonFieldError
                        error={error}
                    />
                    <MultiSelectInput
                        name={name}
                        options={sortedOptions}
                        keySelector={optionKeySelector}
                        labelSelector={optionLabelSelector}
                        onChange={onChange}
                        value={value?.value}
                        readOnly={readOnly}
                        disabled={disabled}
                        error={getErrorString(error?.value)}
                    />
                </>
            )}
        </WidgetWrapper>
    );
}

export default MultiSelectWidgetInput;