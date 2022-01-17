import React from 'react';
import { SelectInput } from '@the-deep/deep-ui';

type EverySome = 'some' | 'every';

interface Option {
    name: string;
    value: EverySome;
}

const keySelector = (d: Option) => d.value;

const labelSelector = (d: Option) => d.name;

interface Props<K extends string> {
    className?: string;
    name: K;
    value: EverySome | null | undefined;
    onChange: (
        value: EverySome,
        name: K,
    ) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
    readOnly?: boolean;
}

const options: Option[] = [
    {
        name: 'Some',
        value: 'some',
    },
    {
        name: 'Every',
        value: 'every',
    },
];

function EverySomeInput<K extends string>(props: Props<K>) {
    return (
        <SelectInput
            keySelector={keySelector}
            labelSelector={labelSelector}
            options={options}
            nonClearable
            {...props}
        />
    );
}

export default EverySomeInput;
