import React, { useMemo, useCallback } from 'react';
import {
    SelectInput,
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

    actions?: React.ReactNode,
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
        onChange: onChangeFromProps,
        actions,
        widget,
        disabled,
        readOnly,
        error: riskyError,
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
            <SelectInput
                name={name}
                options={sortedOptions}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                onChange={onChange}
                value={value?.value}
                readOnly={readOnly}
                disabled={disabled}
                error={error?.value}
            />
        </WidgetWrapper>
    );
}

export default SingleSelectWidgetInput;
