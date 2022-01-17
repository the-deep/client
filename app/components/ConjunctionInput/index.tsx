import React from 'react';
import { SegmentInput } from '@the-deep/deep-ui';

type Conjunction = 'AND' | 'OR' | 'XOR';

interface Option {
    name: string;
    value: Conjunction;
}

const keySelector = (d: Option) => d.value;

const labelSelector = (d: Option) => d.name;

interface Props<K extends string> {
    className?: string;
    name: K;
    value: Conjunction | null | undefined;
    onChange: (
        value: Conjunction,
        name: K,
    ) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
    readOnly?: boolean;
}

const options: Option[] = [
    {
        name: 'And',
        value: 'AND',
    },
    {
        name: 'Or',
        value: 'OR',
    },
    {
        name: 'Xor',
        value: 'XOR',
    },
];

function ConjunctionInput<K extends string>(props: Props<K>) {
    return (
        <SegmentInput
            keySelector={keySelector}
            labelSelector={labelSelector}
            options={options}
            {...props}
        />
    );
}

export default ConjunctionInput;
