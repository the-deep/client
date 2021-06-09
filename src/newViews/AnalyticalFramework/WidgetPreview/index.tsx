import React from 'react';

import { Widget, PartialForm } from '../types';
import TextWidgetInput, { Props as TextWidgetInputProps } from './TextWidgetInput';
import DateWidgetInput, { Props as DateWidgetInputProps } from './DateWidgetInput';
import Matrix1dWidgetInput, { Props as Matrix1dWidgetInputProps } from './Matrix1dWidgetInput';
import NumberWidgetInput, { Props as NumberWidgetInputProps } from './NumberWidgetInput';
import TimeWidgetInput, { Props as TimeWidgetInputProps } from './TimeWidgetInput';
import DateRangeWidgetInput, { Props as DateRangeWidgetInputProps } from './DateRangeWidgetInput';
import TimeRangeWidgetInput, { Props as TimeRangeWidgetInputProps } from './TimeRangeWidgetInput';

import BaseWidgetInput from './BaseWidgetInput';

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
                title={widget.title}
                name={name}
                onChange={onChangeForText}
                value={valueForText}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
            />
        );
    }
    if (widget.type === 'number') {
        // NOTE: we are casting this value
        const onChangeForNumber = onChange as NumberWidgetInputProps<string>['onChange'];
        const valueForNumber = value as NumberWidgetInputProps<string>['value'];

        return (
            <NumberWidgetInput
                className={className}
                title={widget.title}
                name={name}
                onChange={onChangeForNumber}
                value={valueForNumber}
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
                title={widget.title}
                name={name}
                onChange={onChangeForDate}
                value={valueForDate}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
            />
        );
    }
    if (widget.type === 'time') {
        // NOTE: we are casting this value
        const onChangeForTime = onChange as TimeWidgetInputProps<string>['onChange'];
        const valueForTime = value as TimeWidgetInputProps<string>['value'];

        return (
            <TimeWidgetInput
                className={className}
                title={widget.title}
                name={name}
                onChange={onChangeForTime}
                value={valueForTime}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
            />
        );
    }
    if (widget.type === 'date-range') {
        // NOTE: we are casting this value
        const onChangeForDate = onChange as DateRangeWidgetInputProps<string>['onChange'];
        const valueForDate = value as DateRangeWidgetInputProps<string>['value'];

        return (
            <DateRangeWidgetInput
                className={className}
                title={widget.title}
                name={name}
                onChange={onChangeForDate}
                value={valueForDate}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
            />
        );
    }
    if (widget.type === 'time-range') {
        // NOTE: we are casting this value
        const onChangeForTimeRange = onChange as TimeRangeWidgetInputProps<string>['onChange'];
        const valueForTimeRange = value as TimeRangeWidgetInputProps<string>['value'];
        return (
            <TimeRangeWidgetInput
                className={className}
                title={widget.title}
                name={name}
                onChange={onChangeForTimeRange}
                value={valueForTimeRange}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
            />
        );
    }
    if (widget.type === 'matrix-1d') {
        // NOTE: we are casting this value
        const onChangeForMatrix1d = onChange as Matrix1dWidgetInputProps<string>['onChange'];
        const valueForMatrix1d = value as Matrix1dWidgetInputProps<string>['value'];

        return (
            <Matrix1dWidgetInput
                className={className}
                title={widget.title}
                name={name}
                onChange={onChangeForMatrix1d}
                value={valueForMatrix1d}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
                widget={widget}
            />
        );
    }
    return (
        <BaseWidgetInput
            className={className}
            title={widget.title}
            actions={actions}
        />
    );
}

export default WidgetPreview;
