import React from 'react';

import { Widget, PartialForm } from '../types';
import TextWidgetInput, { Props as TextWidgetInputProps } from './TextWidgetInput';
import DateWidgetInput, { Props as DateWidgetInputProps } from './DateWidgetInput';

export type PartialWidget = PartialForm<
    Widget,
    'clientId' | 'type'
>;

interface Props <N extends string, T>{
    className?: string,
    widget: PartialWidget,
    name: N,
    value: T | null | undefined,
    onChange: (value: T | undefined, name: N) => void,
    actions?: React.ReactNode,
    readOnly?: boolean;
    disabled?: boolean;
}
function WidgetPreview<N extends string, T>(props: Props<N, T>) {
    const {
        className,
        widget,
        name,
        value,
        onChange,
        readOnly,
        disabled,
        actions,
    } = props;

    if (widget.type === 'text') {
        // NOTE: we are casting this value
        const onChangeForText = onChange as TextWidgetInputProps<string>['onChange'];
        const valueForText = value as TextWidgetInputProps<string>['value'];

        return (
            <TextWidgetInput
                className={className}
                title={widget.title ?? 'Unnamed'}
                name={name}
                onChange={onChangeForText}
                value={valueForText}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
            />
        );
    }
    if (widget.type === 'date') {
        // NOTE: we are casting this value
        const onChangeForDate = onChange as DateWidgetInputProps<string>['onChange'];
        const valueForDate = value as DateWidgetInputProps<string>['value'];

        return (
            <DateWidgetInput
                className={className}
                title={widget.title ?? 'Unnamed'}
                name={name}
                onChange={onChangeForDate}
                value={valueForDate}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
            />
        );
    }
    return null;
}

export default WidgetPreview;
