import React, { useCallback } from 'react';

import { Widget, PartialForm } from '../types';
import TextWidgetForm from './TextWidgetForm';

type PartialWidget = PartialForm<
    Widget,
    'type' | 'clientId'
>;

interface Props {
    sectionId: string;
    initialValue: PartialWidget,
    onChange: (value: PartialWidget, sectionId: string) => void;
    onSave: (value: Widget, sectionId: string) => void;
    onCancel: () => void;
}
function WidgetEditor(props: Props) {
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
    return null;
}

export default WidgetEditor;
