import React, { useMemo, useCallback } from 'react';
import {
    MultiSelectInput,
} from '@the-deep/deep-ui';
import { PartialForm, Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';
import { isNotDefined } from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import { sortByOrder } from '#utils/common';

import { MultiSelectWidget } from '#types/newAnalyticalFramework';
import { MultiSelectWidgetAttribute } from '#types/newEntry';
import WidgetWrapper from '../WidgetWrapper';

type MultiSelectValue = NonNullable<MultiSelectWidgetAttribute['data']>;

export type PartialMultiSelectWidget = PartialForm<
    MultiSelectWidget,
    'key' | 'widgetId' | 'order' | 'conditional'
>;

type Option = NonNullable<NonNullable<
    NonNullable<PartialMultiSelectWidget>['properties']
>['options']>[number];

const optionKeySelector = (option: Option) => option.key;
const optionLabelSelector = (option: Option) => option.label ?? 'Unnamed';

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: MultiSelectValue | null | undefined,
    error: Error<MultiSelectValue> | undefined;
    onChange: (value: MultiSelectValue | undefined, name: N) => void,

    actions?: React.ReactNode,
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
        actions,
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

    return (
        <WidgetWrapper
            className={className}
            title={title}
            actions={actions}
            error={error}
        >
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
        </WidgetWrapper>
    );
}

export default MultiSelectWidgetInput;
