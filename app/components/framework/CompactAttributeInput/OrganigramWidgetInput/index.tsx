import React, { useCallback, useMemo } from 'react';
import {
    MultiSelectInput,
} from '@the-deep/deep-ui';
import {
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import { PartialForm, Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { OrganigramWidgetAttribute } from '#types/newEntry';
import { OrganigramWidget, OrganigramDatum } from '#types/newAnalyticalFramework';

import WidgetWrapper from '../WidgetWrapper';

export type PartialOrganigramWidget = PartialForm<
    OrganigramWidget,
    'key' | 'widgetId' | 'order'
>;

type OrganigramValue = NonNullable<OrganigramWidgetAttribute['data']>;

type Option = NonNullable<NonNullable<
NonNullable<PartialOrganigramWidget>['properties']
>['options']>;

const optionKeySelector = (option: Option) => option.key;
const optionLabelSelector = (option: Option) => option.label ?? 'Unnamed';

function getFlatOptions(data?: OrganigramDatum, prefix?: string): Omit<OrganigramDatum, 'children'>[] {
    if (!data) {
        return [];
    }
    const { children, ...values } = data;
    const label = `${prefix ? `${prefix}/` : ''}${values.label}`;
    const childrenValues = children?.flatMap((v) => getFlatOptions(v, label)) ?? [];
    return [
        { ...values, label },
        ...childrenValues,
    ];
}

export interface Props <N extends string> {
    title: string | undefined;
    className?: string;

    name: N;
    value: OrganigramValue | null | undefined;
    error: Error<OrganigramValue> | undefined;
    onChange: (value: OrganigramValue | undefined, name: N) => void;

    disabled?: boolean;
    readOnly?: boolean;

    widget: PartialOrganigramWidget;
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
        error: riskyError,
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
        getFlatOptions(widget.properties?.options as OrganigramDatum)
    ), [widget.properties?.options]);

    const selectedValues = useMemo(() => {
        const optionsMap = listToMap(options, (d) => d.key, (d) => d.label);
        return value?.value?.map((v) => optionsMap?.[v]);
    }, [options, value]);

    return (
        <WidgetWrapper
            className={className}
            title={title}
            error={error}
            disabled={disabled}
            readOnly={readOnly}
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
                </>
            )}
        </WidgetWrapper>
    );
}

export default OrganigramWidgetInput;
