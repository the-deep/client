import React from 'react';
import { PartialForm } from '@togglecorp/toggle-form';

import { OrganigramValue, OrganigramWidget } from '#types/newAnalyticalFramework';
import OrganigramInput from '#components/OrganigramInput';
import WidgetWrapper from '../WidgetWrapper';

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
        onChange,
        actions,
        widget,
        disabled,
        readOnly,
    } = props;

    return (
        <WidgetWrapper
            className={className}
            title={title}
            actions={actions}
        >
            <OrganigramInput
                name={name}
                value={value}
                onChange={onChange}
                options={widget.properties?.options}
                disabled={disabled}
                readOnly={readOnly}
            />
        </WidgetWrapper>
    );
}

export default OrganigramWidgetInput;
