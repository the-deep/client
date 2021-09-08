import React, { useCallback } from 'react';
import { PartialForm } from '@togglecorp/toggle-form';

import { Widget } from '#types/newAnalyticalFramework';

import TextWidgetForm from './TextWidgetForm';
import NumberWidgetForm from './NumberWidgetForm';
import DateWidgetForm from './DateWidgetForm';
import TimeRangeWidgetForm from './TimeRangeWidgetForm';
import Matrix2dWidgetForm from './Matrix2dWidgetForm';
import Matrix1dWidgetForm from './Matrix1dWidgetForm';
import TimeWidgetForm from './TimeWidgetForm';
import DateRangeWidgetForm from './DateRangeWidgetForm';
import MultiSelectWidgetForm from './MultiSelectWidgetForm';
import ScaleWidgetForm from './ScaleWidgetForm';
import SingleSelectWidgetForm from './SingleSelectWidgetForm';
import OrganigramWidgetForm from './OrganigramWidgetForm';

type PartialWidget = PartialForm<
    Widget,
    'key' | 'widgetId' | 'clientId' | 'order'
>;

interface Props<T> {
    name: T;
    initialValue: PartialWidget,
    onChange: (value: PartialWidget, name: T) => void;
    onSave: (value: Widget, name: T) => void;
    onCancel: () => void;
    className?: string;
}
function WidgetEditor<T>(props: Props<T>) {
    const {
        name,
        initialValue,
        onChange,
        onSave,
        onCancel,
        className,
    } = props;

    const handleChange = useCallback(
        (val: PartialWidget) => {
            onChange(val, name);
        },
        [onChange, name],
    );

    const handleSave = useCallback(
        (val: Widget) => {
            onSave(val, name);
        },
        [onSave, name],
    );

    switch (initialValue.widgetId) {
        case 'TEXT': {
            return (
                <TextWidgetForm
                    className={className}
                    initialValue={initialValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            );
        }
        case 'NUMBER': {
            return (
                <NumberWidgetForm
                    className={className}
                    initialValue={initialValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            );
        }
        case 'DATE': {
            return (
                <DateWidgetForm
                    className={className}
                    initialValue={initialValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            );
        }
        case 'TIME': {
            return (
                <TimeWidgetForm
                    className={className}
                    initialValue={initialValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            );
        }
        case 'DATE_RANGE': {
            return (
                <DateRangeWidgetForm
                    className={className}
                    initialValue={initialValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            );
        }
        case 'TIME_RANGE': {
            return (
                <TimeRangeWidgetForm
                    className={className}
                    initialValue={initialValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            );
        }
        case 'MATRIX1D': {
            return (
                <Matrix1dWidgetForm
                    className={className}
                    initialValue={initialValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            );
        }
        case 'MATRIX2D': {
            return (
                <Matrix2dWidgetForm
                    className={className}
                    initialValue={initialValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            );
        }
        case 'SCALE': {
            return (
                <ScaleWidgetForm
                    className={className}
                    initialValue={initialValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            );
        }
        case 'MULTISELECT': {
            return (
                <MultiSelectWidgetForm
                    className={className}
                    initialValue={initialValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            );
        }
        case 'SELECT': {
            return (
                <SingleSelectWidgetForm
                    className={className}
                    initialValue={initialValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            );
        }
        case 'ORGANIGRAM': {
            return (
                <OrganigramWidgetForm
                    className={className}
                    initialValue={initialValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            );
        }
        default: {
            return null;
        }
    }
}

export default WidgetEditor;
