import React, { useCallback } from 'react';
import {
    SegmentInput,
} from '@the-deep/deep-ui';

interface Option {
    key: 'private' | 'public';
    label: string;
}

const widgetWidthOptions: Option[] = [
    {
        key: 'public',
        // FIXME: Use translations
        label: 'Public',
    },
    {
        key: 'private',
        // FIXME: Use translations
        label: 'Private',
    },
];

const widgetKeySelector = (d: Option) => d.key;
const widgetLabelSelector = (d: Option) => d.label;

interface Props<N extends string> {
    name: N;
    value?: boolean;
    className?: string;
    onChange: (newValue: boolean, name: N) => void;
    error?: string;
    disabled?: boolean
    label?: string;
}

function PrivacyInput<N extends string>(props: Props<N>) {
    const {
        name,
        className,
        onChange,
        value,
        error,
        disabled,
        label,
    } = props;

    const segmentValue = value ? 'private' : 'public';

    const handleChange = useCallback(
        (newVal: 'public' | 'private') => {
            onChange(newVal === 'private', name);
        },
        [name, onChange],
    );

    return (
        <SegmentInput
            label={label}
            className={className}
            name={name}
            onChange={handleChange}
            options={widgetWidthOptions}
            keySelector={widgetKeySelector}
            labelSelector={widgetLabelSelector}
            value={segmentValue}
            error={error}
            disabled={disabled}
        />
    );
}

export default PrivacyInput;
