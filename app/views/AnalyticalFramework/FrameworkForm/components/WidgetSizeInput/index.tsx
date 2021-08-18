import React from 'react';
import {
    SegmentInput,
} from '@the-deep/deep-ui';
import {
    WidgetWidth,
} from '#generated/types';

interface WidgetWidthOption {
    key: WidgetWidth;
    label: string;
}

const widgetWidthOptions: WidgetWidthOption[] = [
    {
        key: 'FULL',
        // FIXME: Use translations
        label: 'Full',
    },
    {
        key: 'HALF',
        // FIXME: Use translations
        label: 'Half',
    },
];

const widgetKeySelector = (d: WidgetWidthOption) => d.key;
const widgetLabelSelector = (d: WidgetWidthOption) => d.label;

interface Props<N extends string> {
    name: N;
    value?: WidgetWidth;
    className?: string;
    onChange: (newWidth: WidgetWidth, name: N) => void;
    error?: string;
}

function WidgetSizeInput<N extends string>(props: Props<N>) {
    const {
        name,
        className,
        onChange,
        value = 'FULL',
        error,
    } = props;

    return (
        <SegmentInput
            // FIXME: Use translations
            label="Width"
            className={className}
            name={name}
            onChange={onChange}
            options={widgetWidthOptions}
            keySelector={widgetKeySelector}
            labelSelector={widgetLabelSelector}
            value={value}
            error={error}
        />
    );
}

export default WidgetSizeInput;
