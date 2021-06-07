import React, { useCallback } from 'react';

import { Widget, PartialForm } from '../types';
import TextWidgetForm from './TextWidgetForm';
import DateWidgetForm from './DateWidgetForm';
import Matrix2dWidgetForm from './Matrix2dWidgetForm';
import Matrix1dWidgetForm from './Matrix1dWidgetForm';

type PartialWidget = PartialForm<
    Widget,
    'type' | 'clientId'
>;

interface Props<T> {
    name: T;
    initialValue: PartialWidget,
    onChange: (value: PartialWidget, name: T) => void;
    onSave: (value: Widget, name: T) => void;
    onCancel: () => void;
}
function WidgetEditor<T>(props: Props<T>) {
    const {
        name,
        initialValue,
        onChange,
        onSave,
        onCancel,
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

    if (initialValue.type === 'text') {
        return (
            <TextWidgetForm
                initialValue={initialValue}
                onChange={handleChange}
                onSave={handleSave}
                onCancel={onCancel}
            />
        );
    }
    if (initialValue.type === 'date') {
        return (
            <DateWidgetForm
                initialValue={initialValue}
                onChange={handleChange}
                onSave={handleSave}
                onCancel={onCancel}
            />
        );
    }
    if (initialValue.type === 'matrix-1d') {
        return (
            <Matrix1dWidgetForm
                initialValue={initialValue}
                onChange={handleChange}
                onSave={handleSave}
                onCancel={onCancel}
            />
        );
    }
    if (initialValue.type === 'matrix-2d') {
        return (
            <Matrix2dWidgetForm
                initialValue={initialValue}
                onChange={handleChange}
                onSave={handleSave}
                onCancel={onCancel}
            />
        );
    }
    return null;
}

export default WidgetEditor;
