import React, { useCallback } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { PartialForm, Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { OrganigramWidget } from '#types/newAnalyticalFramework';
import { OrganigramWidgetAttribute } from '#types/newEntry';
import OrganigramInput from '#components/OrganigramInput';
import WidgetWrapper from '../WidgetWrapper';

export type PartialOrganigramWidget = PartialForm<
    OrganigramWidget,
    'key' | 'widgetId' | 'order'
>;

type OrganigramValue = NonNullable<OrganigramWidgetAttribute['data']>;

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N;
    value: OrganigramValue | null | undefined;
    error: Error<OrganigramValue> | undefined;
    onChange: (value: OrganigramValue | undefined, name: N) => void;

    actions?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;

    widget: PartialOrganigramWidget,
}

function OrganigramWidgetInput<N extends string>(props: Props<N>) {
    const {
        className,
        title,
        name,
        value,
        actions,
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

    return (
        <WidgetWrapper
            className={className}
            title={title}
            actions={actions}
            error={error}
        >
            <NonFieldError error={error} />
            <OrganigramInput
                name={name}
                value={value?.value}
                onChange={onChange}
                options={widget.properties?.options}
                disabled={disabled || readOnly}
                readOnly={readOnly}
                error={getErrorString(error?.value)}
            />
        </WidgetWrapper>
    );
}

export default OrganigramWidgetInput;
