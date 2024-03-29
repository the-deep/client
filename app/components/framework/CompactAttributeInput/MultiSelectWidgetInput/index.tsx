import React, { useMemo, useCallback } from 'react';
import {
    MultiSelectInput,
    MultiBadgeInput,
} from '@the-deep/deep-ui';
import { PartialForm, Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';
import {
    listToMap,
    isNotDefined,
} from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import { sortByOrder } from '#utils/common';

import { MultiSelectWidget } from '#types/newAnalyticalFramework';
import { MultiSelectWidgetAttribute } from '#types/newEntry';

import WidgetWrapper from '../WidgetWrapper';

import styles from './styles.css';

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

    disabled?: boolean;
    readOnly?: boolean;
    actions?: React.ReactNode;
    icons?: React.ReactNode;

    widget: PartialMultiSelectWidget;
    suggestionMode?: boolean;
    recommendedValue?: MultiSelectValue | null | undefined;
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
        actions,
        icons,
        error: riskyError,
        suggestionMode,
        recommendedValue,
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
        const optionsMap = listToMap(widgetOptions, (d) => d.key, (d) => d.label);
        return value?.value?.map((v) => optionsMap?.[v]);
    }, [widgetOptions, value]);

    const recommendedValuesMap = useMemo(() => (
        listToMap(
            recommendedValue?.value,
            (key) => key,
            () => true,
        )
    ), [recommendedValue]);

    const optionsForSuggestions = useMemo(() => {
        if (!suggestionMode) {
            return [];
        }
        return sortedOptions?.filter((item) => recommendedValuesMap?.[item.key]);
    }, [
        recommendedValuesMap,
        sortedOptions,
        suggestionMode,
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
            {readOnly ? (
                selectedValues?.map((val) => (
                    <div key={val}>
                        {val}
                    </div>
                )) ?? (<div>-</div>)
            ) : (
                <>
                    <NonFieldError
                        error={error}
                    />
                    {!suggestionMode ? (
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
                    ) : (
                        <MultiBadgeInput
                            name={name}
                            value={value?.value}
                            options={optionsForSuggestions}
                            keySelector={optionKeySelector}
                            labelSelector={optionLabelSelector}
                            onChange={onChange}
                            disabled={readOnly || disabled}
                            selectedButtonVariant="nlp-primary"
                            listClassName={styles.suggestions}
                            buttonVariant="nlp-tertiary"
                            smallButtons
                        />
                    )}
                </>
            )}
        </WidgetWrapper>
    );
}

export default MultiSelectWidgetInput;
