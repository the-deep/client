import React, { useCallback } from 'react';

import { Widget, PartialForm } from '../types';
import TextWidgetForm from './TextWidgetForm';
import DateWidgetForm from './DateWidgetForm';

type PartialWidget = PartialForm<
    Widget,
    'type' | 'clientId'
>;

interface Props<T> {
    sectionId: T;
    initialValue: PartialWidget,
    onChange: (value: PartialWidget, sectionId: T) => void;
    onSave: (value: Widget, sectionId: T) => void;
    onCancel: () => void;
}
function WidgetEditor<T>(props: Props<T>) {
    const {
        sectionId,
        initialValue,
        onChange,
        onSave,
        onCancel,
    } = props;

    const handleChange = useCallback(
        (val: PartialWidget) => {
            onChange(val, sectionId);
        },
        [onChange, sectionId],
    );

    const handleSave = useCallback(
        (val: Widget) => {
            onSave(val, sectionId);
        },
        [onSave, sectionId],
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
    return null;
}

export default WidgetEditor;
