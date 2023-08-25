import React, { useMemo, useCallback } from 'react';
import {
    ScaleInput,
    BadgeInput,
} from '@the-deep/deep-ui';
import { PartialForm, Error, getErrorObject } from '@togglecorp/toggle-form';
import { isNotDefined } from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import { sortByOrder } from '#utils/common';

import { ScaleWidget } from '#types/newAnalyticalFramework';
import { ScaleWidgetAttribute } from '#types/newEntry';
import WidgetWrapper from '../WidgetWrapper';

type ScaleValue = NonNullable<ScaleWidgetAttribute['data']>;

export type PartialScaleWidget = PartialForm<
    ScaleWidget,
    'key' | 'widgetId' | 'order' | 'conditional'
>;

type Option = NonNullable<NonNullable<
    NonNullable<PartialScaleWidget>['properties']
>['options']>[number];

const optionKeySelector = (option: Option) => option.key;
const optionLabelSelector = (option: Option) => option.label ?? 'Unnamed';
const optionColorSelector = (option: Option) => option.color ?? '#414141';

export interface Props<N extends string>{
    title: string | undefined;
    className?: string;

    name: N,
    value: ScaleValue | null | undefined,
    error: Error<ScaleValue> | undefined;
    onChange: (value: ScaleValue | undefined, name: N) => void,

    disabled?: boolean;
    readOnly?: boolean;
    actions?: React.ReactNode;
    icons?: React.ReactNode;

    widget: PartialScaleWidget,
    widgetHints?: string[];
}

function ScaleWidgetInput<N extends string>(props: Props<N>) {
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

    const sortedOptions = useMemo(() => (
        sortByOrder(widget?.properties?.options)
    ), [widget?.properties?.options]);

    const onChange = useCallback(
        (val: ScaleValue['value'] | undefined, inputName: N) => {
            if (isNotDefined(val)) {
                onChangeFromProps(undefined, inputName);
            } else {
                onChangeFromProps({ value: val }, inputName);
            }
        },
        [onChangeFromProps],
    );
    const selectedOptions = useMemo(() => (
        sortedOptions?.filter((item) => widgetHints?.includes(item.key))
    ), [
        sortedOptions,
        widgetHints,
    ]);

    return (
        <WidgetWrapper
            className={className}
            title={title}
            error={error}
            readOnly={readOnly}
            actions={actions}
            icons={icons}
        >
            <NonFieldError
                error={error}
            />
            <ScaleInput
                name={name}
                options={sortedOptions}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                colorSelector={optionColorSelector}
                onChange={onChange}
                value={value?.value ?? widget?.properties?.defaultValue}
                readOnly={readOnly}
                disabled={disabled}
                error={error?.value}
                hint={(selectedOptions && selectedOptions.length > 0) && (
                    <BadgeInput
                        name={name}
                        value={value?.value ?? widget?.properties?.defaultValue}
                        options={selectedOptions}
                        labelSelector={optionLabelSelector}
                        keySelector={optionKeySelector}
                        onChange={onChange}
                        disabled={readOnly || disabled}
                        selectedButtonVariant="nlp-primary"
                        buttonVariant="nlp-tertiary"
                        selectedValueHidden
                        smallButtons
                    />
                )}
            />
        </WidgetWrapper>
    );
}

export default ScaleWidgetInput;
