import React from 'react';
import { PartialForm } from '@togglecorp/toggle-form';

import { Widget } from '#types/newAnalyticalFramework';

import TextWidgetInput, { Props as TextWidgetInputProps } from './TextWidgetInput';
import DateWidgetInput, { Props as DateWidgetInputProps } from './DateWidgetInput';
import Matrix1dWidgetInput, { Props as Matrix1dWidgetInputProps } from './Matrix1dWidgetInput';
import Matrix2dWidgetInput, { Props as Matrix2dWidgetInputProps } from './Matrix2dWidgetInput';
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
    'clientId' | 'key' | 'widgetId' | 'order'
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

    switch (widget.widgetId) {
        case 'TEXTWIDGET': {
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
        case 'NUMBERWIDGET': {
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
        case 'DATEWIDGET': {
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
        case 'TIMEWIDGET': {
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
        case 'DATERANGEWIDGET': {
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
        case 'TIMERANGEWIDGET': {
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
        case 'MATRIX1DWIDGET': {
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
        case 'MATRIX2DWIDGET': {
            // NOTE: we are casting this value
            const onChangeForMatrix2d = onChange as Matrix2dWidgetInputProps<string>['onChange'];
            const valueForMatrix2d = value as Matrix2dWidgetInputProps<string>['value'];

            return (
                <Matrix2dWidgetInput
                    className={className}
                    title={widget.title}
                    name={name}
                    onChange={onChangeForMatrix2d}
                    value={valueForMatrix2d}
                    readOnly={readOnly}
                    disabled={disabled}
                    actions={actions}
                    widget={widget}
                />
            );
        }
        case 'SCALEWIDGET': {
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
                    actions={actions}
                    widget={widget}
                />
            );
        }
        case 'MULTISELECTWIDGET': {
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
                    actions={actions}
                    widget={widget}
                />
            );
        }
        case 'SELECTWIDGET': {
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
                    actions={actions}
                    widget={widget}
                />
            );
        }
        default: {
            return (
                <BaseWidgetInput
                    className={className}
                    title={widget.title}
                    actions={actions}
                />
            );
        }
    }
}

export default WidgetPreview;
