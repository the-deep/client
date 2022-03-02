import React, { useMemo, useCallback } from 'react';
import {
    SelectInput,
    Suggestion,
} from '@the-deep/deep-ui';
import { PartialForm, Error, getErrorObject } from '@togglecorp/toggle-form';
import { isNotDefined } from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import { sortByOrder } from '#utils/common';

import { SingleSelectWidget } from '#types/newAnalyticalFramework';
import { SingleSelectWidgetAttribute } from '#types/newEntry';
import WidgetWrapper from '../WidgetWrapper';

type SingleSelectValue = NonNullable<SingleSelectWidgetAttribute['data']>;

export type PartialSingleSelectWidget = PartialForm<
    SingleSelectWidget,
    'key' | 'widgetId' | 'order' | 'conditional'
>;

type Option = NonNullable<NonNullable<
    NonNullable<PartialSingleSelectWidget>['properties']
>['options']>[number];

const optionKeySelector = (option: Option) => option.key;
const optionLabelSelector = (option: Option) => option.label ?? 'Unnamed';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: SingleSelectValue | null | undefined,
    error: Error<SingleSelectValue> | undefined;
    onChange: (value: SingleSelectValue | undefined, name: N) => void,

    disabled?: boolean;
    readOnly?: boolean;
    actions?: React.ReactNode;
    icons?: React.ReactNode;

    widget: PartialSingleSelectWidget,
    widgetHints?: string[];
}

function SingleSelectWidgetInput<N extends string>(props: Props<N>) {
    const {
        className,
        title,
        name,
        value,
        onChange: onChangeFromProps,
        widget,
        disabled,
        readOnly,
        actions,
        icons,
        error: riskyError,
        widgetHints,
    } = props;

    const error = getErrorObject(riskyError);

    const onChange = useCallback(
        (val: SingleSelectValue['value'] | undefined, inputName: N) => {
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

    const selectedValue = useMemo(() => (
        widgetOptions?.find((o) => o.key === value?.value)?.label
    ), [widgetOptions, value]);

    const selectedOptions = useMemo(() => (
        sortedOptions?.filter((item) => widgetHints?.includes(item.key)) ?? []
    ), [
        sortedOptions,
        widgetHints,
    ]);

    return (
        <WidgetWrapper
            className={className}
            title={title}
            error={error}
            disabled={disabled}
            readOnly={readOnly}
            actions={actions}
            icons={icons}
        >
            {readOnly ? (
                <div>
                    {selectedValue ?? '-'}
                </div>
            ) : (
                <>
                    <NonFieldError
                        error={error}
                    />
                    <SelectInput
                        name={name}
                        options={sortedOptions}
                        keySelector={optionKeySelector}
                        labelSelector={optionLabelSelector}
                        onChange={onChange}
                        value={value?.value}
                        readOnly={readOnly}
                        disabled={disabled}
                        hint={(
                            <Suggestion
                                name={name}
                                options={selectedOptions}
                                value={value?.value}
                                onChange={onChange}
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                disabled={readOnly || disabled}
                            />
                        )}
                    />
                </>
            )}
        </WidgetWrapper>
    );
}

export default SingleSelectWidgetInput;
