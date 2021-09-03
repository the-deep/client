import React from 'react';
import { PartialForm } from '@togglecorp/toggle-form';

import OrganigramInput from '#components/OrganigramInput';
import { OrganigramValue, OrganigramWidget } from '#types/newAnalyticalFramework';

import ListWidgetWrapper from '../ListWidgetWrapper';

export type PartialOrganigramWidget = PartialForm<
    OrganigramWidget,
    'clientId' | 'key' | 'widgetId' | 'order'
>;

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
        onChange,
        widget,
        disabled,
        readOnly,
    } = props;

    return (
        <ListWidgetWrapper
            className={className}
            title={title}
            disabled={disabled}
            readOnly={readOnly}
        >
            <OrganigramInput
                name={name}
                value={value}
                onChange={onChange}
                options={widget.properties?.options}
                disabled={disabled}
                readOnly={readOnly}
            />
        </ListWidgetWrapper>
    );
}

export default OrganigramWidgetInput;
