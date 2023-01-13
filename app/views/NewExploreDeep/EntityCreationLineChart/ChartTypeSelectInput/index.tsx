import React from 'react';
import {
    SegmentInput,
} from '@the-deep/deep-ui';
import {
    IoStatsChartSharp,
    IoTrendingUpSharp,
} from 'react-icons/io5';

interface ChartTypeOption {
    key: 'step' | 'spark';
    label: React.ReactNode;
}
const chartTypeKeySelector = (d: ChartTypeOption) => d.key;
const chartTypeLabelSelector = (d: ChartTypeOption) => d.label;

const chartTypeOptions: ChartTypeOption[] = [
    {
        key: 'step',
        label: <IoStatsChartSharp />,
    },
    {
        key: 'spark',
        label: <IoTrendingUpSharp />,
    },
];

interface Props {
    className?: string;
    value: ChartTypeOption['key'];
    onChange: (newChartType: ChartTypeOption['key']) => void;
}

function ChartTypeSelectInput(props: Props) {
    const {
        className,
        value,
        onChange,
    } = props;

    return (
        <SegmentInput
            className={className}
            name={undefined}
            onChange={onChange}
            spacing="compact"
            options={chartTypeOptions}
            keySelector={chartTypeKeySelector}
            labelSelector={chartTypeLabelSelector}
            value={value}
        />
    );
}

export default ChartTypeSelectInput;
