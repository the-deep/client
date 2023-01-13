import React from 'react';
import {
    SegmentInput,
} from '@the-deep/deep-ui';

export interface ResolutionOption {
    key: 'day' | 'month' | 'year';
    label: React.ReactNode;
}

const resolutionKeySelector = (d: ResolutionOption) => d.key;
const resolutionLabelSelector = (d: ResolutionOption) => d.label;

const resolutionOptions: ResolutionOption[] = [
    {
        key: 'day',
        label: 'D',
    },
    {
        key: 'month',
        label: 'M',
    },
    {
        key: 'year',
        label: 'Y',
    },
];
interface Props {
    className?: string;
    value: ResolutionOption['key'];
    onChange: (newResolution: ResolutionOption['key']) => void;
}

function ResolutionSelectInput(props: Props) {
    const {
        className,
        value,
        onChange,
    } = props;

    return (
        <SegmentInput
            className={className}
            name={undefined}
            spacing="compact"
            onChange={onChange}
            options={resolutionOptions}
            keySelector={resolutionKeySelector}
            labelSelector={resolutionLabelSelector}
            value={value}
        />
    );
}

export default ResolutionSelectInput;
