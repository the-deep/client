import React from 'react';
import { PartialForm } from '@togglecorp/toggle-form';

import { Widget } from '#types/newAnalyticalFramework';
import TextWidgetInput, { Props as TextWidgetInputProps } from './TextWidgetInput';
import DateWidgetInput, { Props as DateWidgetInputProps } from './DateWidgetInput';
import NumberWidgetInput, { Props as NumberWidgetInputProps } from './NumberWidgetInput';
import TimeWidgetInput, { Props as TimeWidgetInputProps } from './TimeWidgetInput';
import DateRangeWidgetInput, { Props as DateRangeWidgetInputProps } from './DateRangeWidgetInput';
import TimeRangeWidgetInput, { Props as TimeRangeWidgetInputProps } from './TimeRangeWidgetInput';
import ScaleWidgetInput, { Props as ScaleWidgetInputProps } from './ScaleWidgetInput';
import MultiSelectWidgetInput, { Props as MultiSelectWidgetInputProps } from './MultiSelectWidgetInput';
import SingleSelectWidgetInput, { Props as SingleSelectWidgetInputProps } from './SingleSelectWidgetInput';

import BaseWidgetInput from './BaseWidgetInput';

export type PartialWidget = PartialForm<
    Widget,
    'clientId' | 'type' | 'order'
>;

interface Props <N extends string, T>{
    className?: string,
    widget: PartialWidget,
    name: N,
    value: T | null | undefined,
    onChange: (value: T | undefined, name: N) => void,
    readOnly?: boolean;
    disabled?: boolean;
}

function ListWidgetPreview<N extends string, T>(props: Props<N, T>) {
    const {
        className,
        widget,
        name,
        value,
        onChange,
        readOnly,
        disabled,
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
            />
        );
    }
    if (widget.type === 'scale') {
        // NOTE: we are casting this value
        const onChangeForTimeRange = onChange as ScaleWidgetInputProps<string>['onChange'];
        const valueForTimeRange = value as ScaleWidgetInputProps<string>['value'];
        return (
            <ScaleWidgetInput
                className={className}
                title={widget.title}
                name={name}
                onChange={onChangeForTimeRange}
                value={valueForTimeRange}
                readOnly={readOnly}
                disabled={disabled}
                widget={widget}
            />
        );
    }
    if (widget.type === 'multi-select') {
        // NOTE: we are casting this value
        const onChangeForMultiSelect = onChange as MultiSelectWidgetInputProps<string>['onChange'];
        const valueForMultiSelect = value as MultiSelectWidgetInputProps<string>['value'];

        return (
            <MultiSelectWidgetInput
                className={className}
                title={widget.title}
                name={name}
                onChange={onChangeForMultiSelect}
                value={valueForMultiSelect}
                readOnly={readOnly}
                disabled={disabled}
                widget={widget}
            />
        );
    }
    if (widget.type === 'single-select') {
        // NOTE: we are casting this value
        const onChangeForSingleSelect = onChange as SingleSelectWidgetInputProps<string>['onChange'];
        const valueForSingleSelect = value as SingleSelectWidgetInputProps<string>['value'];

        return (
            <SingleSelectWidgetInput
                className={className}
                title={widget.title}
                name={name}
                onChange={onChangeForSingleSelect}
                value={valueForSingleSelect}
                readOnly={readOnly}
                disabled={disabled}
                widget={widget}
            />
        );
    }
    return (
        <BaseWidgetInput
            className={className}
            title={widget.title}
        />
    );
}

export default ListWidgetPreview;
