import React, { useCallback, useMemo } from 'react';
import {
    MultiSelectInput,
    MultiBadgeInput,
} from '@the-deep/deep-ui';
import {
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import { PartialForm, Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { OrganigramWidgetAttribute } from '#types/newEntry';
import { OrganigramWidget, OrganigramDatum } from '#types/newAnalyticalFramework';
import { getOrganigramFlatOptions } from './utils';

import WidgetWrapper from '../WidgetWrapper';

import styles from './styles.css';

export type PartialOrganigramWidget = PartialForm<
    OrganigramWidget,
    'key' | 'widgetId' | 'order' | 'conditional'
>;

type OrganigramValue = NonNullable<OrganigramWidgetAttribute['data']>;

type Option = NonNullable<NonNullable<
NonNullable<PartialOrganigramWidget>['properties']
>['options']>;

const optionKeySelector = (option: Option) => option.key;
const optionLabelSelector = (option: Option) => option.label ?? 'Unnamed';

export interface Props <N extends string> {
    title: string | undefined;
    className?: string;

    name: N;
    value: OrganigramValue | null | undefined;
    error: Error<OrganigramValue> | undefined;
    onChange: (value: OrganigramValue | undefined, name: N) => void;

    disabled?: boolean;
    readOnly?: boolean;
    actions?: React.ReactNode;
    icons?: React.ReactNode;

    widget: PartialOrganigramWidget;
    suggestionMode?: boolean;
    recommendedValue?: OrganigramValue | null | undefined;
}

function OrganigramWidgetInput<N extends string>(props: Props<N>) {
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
        (val: OrganigramValue['value'] | undefined, inputName: N) => {
            if (isNotDefined(val)) {
                onChangeFromProps(undefined, inputName);
            } else {
                onChangeFromProps({ value: val }, inputName);
            }
        },
        [onChangeFromProps],
    );

    const options = useMemo(() => (
        getOrganigramFlatOptions(widget.properties?.options as OrganigramDatum)
    ), [widget.properties?.options]);

    const recommendedValuesMap = useMemo(() => (
        listToMap(
            recommendedValue?.value,
            (key) => key,
            () => true,
        )
    ), [recommendedValue]);

    const selectedValues = useMemo(() => {
        const optionsMap = listToMap(options, (d) => d.key, (d) => d.label);
        return value?.value?.map((v) => optionsMap?.[v]);
    }, [options, value]);

    const optionsForSuggestions = useMemo(() => {
        if (!suggestionMode) {
            return [];
        }
        return options?.filter((item) => recommendedValuesMap?.[item.key]);
    }, [
        recommendedValuesMap,
        options,
        suggestionMode,
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
                selectedValues?.map((val) => (
                    <div key={val}>
                        {val}
                    </div>
                )) ?? (<div>-</div>)
            ) : (
                <>
                    <NonFieldError error={error} />
                    {!suggestionMode ? (
                        <MultiSelectInput
                            name={name}
                            value={value?.value}
                            onChange={onChange}
                            options={options}
                            disabled={disabled}
                            readOnly={readOnly}
                            keySelector={optionKeySelector}
                            labelSelector={optionLabelSelector}
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
                            disabled={disabled}
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

export default OrganigramWidgetInput;
