import React, { useCallback } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { PartialForm } from '@togglecorp/toggle-form';

import OrganigramInput from '#components/OrganigramInput';
import { OrganigramWidgetAttribute } from '#types/newEntry';
import { OrganigramWidget } from '#types/newAnalyticalFramework';

import WidgetWrapper from '../WidgetWrapper';

export type PartialOrganigramWidget = PartialForm<
    OrganigramWidget,
    'clientId' | 'key' | 'widgetId' | 'order'
>;

type OrganigramValue = NonNullable<OrganigramWidgetAttribute['data']>;

export interface Props <N extends string>{
    title: string | undefined;
    className?: string;

    name: N;
    value: OrganigramValue | null | undefined;
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
    } = props;

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
            disabled={disabled}
            readOnly={readOnly}
        >
            <OrganigramInput
                name={name}
                value={value?.value}
                onChange={onChange}
                options={widget.properties?.options}
                disabled={disabled}
                readOnly={readOnly}
            />
        </WidgetWrapper>
    );
}

export default OrganigramWidgetInput;
