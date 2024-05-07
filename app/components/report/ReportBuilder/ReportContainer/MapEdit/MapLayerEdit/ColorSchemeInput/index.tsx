import React, { useCallback } from 'react';
import { SelectInput } from '@the-deep/deep-ui';
import * as d3ColorScale from 'd3-scale-chromatic';

import styles from './styles.css';

export type D3InterpolationSchemes = 'Blues' | 'Greens' | 'Greys' | 'Oranges' | 'Purples' | 'Reds' | 'Turbo' | 'Viridis' | 'Inferno' | 'Magma' | 'Plasma' | 'Cividis' | 'Warm' | 'Cool' | 'CubehelixDefault' | 'BuGn' | 'BuPu' | 'GnBu' | 'OrRd' | 'PuBuGn' | 'PuBu' | 'PuRd' | 'RdPu' | 'YlGnBu' | 'YlGn' | 'YlOrBr' | 'YlOrRd'
| 'Rainbow' | 'Sinebow'
| 'BrBG' | 'PRGn' | 'PiYG' | 'PuOr' | 'RdBu' | 'RdGy' | 'RdYlBu' | 'RdYlGn' | 'Spectral';

interface ColorItem {
    key: D3InterpolationSchemes;
    label: string;
    groupKey: string;
}
const dataSeriesGroupMap = [
    {
        key: 'seq-single-hue',
        label: 'Sequential (Single-Hue)',
    },
    {
        key: 'seq-multi-hue',
        label: 'Sequential (Multi-Hue)',
    },
    {
        key: 'cyclical',
        label: 'Cyclical',
    },
    {
        key: 'diverging',
        label: 'Diverging',
    },
];
const colorOptions: ColorItem[] = [
    {
        key: 'Blues',
        label: 'Blues',
        groupKey: 'seq-single-hue',
    },
    {
        key: 'Greens',
        label: 'Greens',
        groupKey: 'seq-single-hue',
    },
    {
        key: 'Greys',
        label: 'Greys',
        groupKey: 'seq-single-hue',
    },
    {
        key: 'Oranges',
        label: 'Oranges',
        groupKey: 'seq-single-hue',
    },
    {
        key: 'Purples',
        label: 'Purples',
        groupKey: 'seq-single-hue',
    },
    {
        key: 'Reds',
        label: 'Reds',
        groupKey: 'seq-single-hue',
    },
    {
        key: 'Turbo',
        label: 'Turbo',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'Viridis',
        label: 'Viridis',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'Inferno',
        label: 'Inferno',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'Magma',
        label: 'Magma',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'Plasma',
        label: 'Plasma',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'Cividis',
        label: 'Cividis',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'Warm',
        label: 'Warm',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'Cool',
        label: 'Cool',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'CubehelixDefault',
        label: 'CubehelixDefault',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'BuGn',
        label: 'Blue-Green',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'BuPu',
        label: 'Blue-Purple',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'GnBu',
        label: 'Green-Blue',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'OrRd',
        label: 'Orange-Red',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'PuBuGn',
        label: 'Purple-Blue-Green',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'PuBu',
        label: 'Purple-Blue',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'PuRd',
        label: 'Purple-Red',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'RdPu',
        label: 'Purple-Red',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'YlGnBu',
        label: 'Yellow-Green-Blue',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'YlGn',
        label: 'Yellow-Green',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'YlOrBr',
        label: 'Yellow-Orange-Brown',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'YlOrRd',
        label: 'Yellow-Orange-Red',
        groupKey: 'seq-multi-hue',
    },
    {
        key: 'Rainbow',
        label: 'Rainbow',
        groupKey: 'cyclical',
    },
    {
        key: 'Sinebow',
        label: 'Sinebow',
        groupKey: 'cyclical',
    },
    {
        key: 'BrBG',
        label: 'Brown-Green',
        groupKey: 'diverging',
    },
    {
        key: 'PRGn',
        label: 'Purple-Green',
        groupKey: 'diverging',
    },
    {
        key: 'PiYG',
        label: 'Pink-Green',
        groupKey: 'diverging',
    },
    {
        key: 'PuOr',
        label: 'Purple-Orange',
        groupKey: 'diverging',
    },
    {
        key: 'RdBu',
        label: 'Red-Blue',
        groupKey: 'diverging',
    },
    {
        key: 'RdGy',
        label: 'Red-Grey',
        groupKey: 'diverging',
    },
    {
        key: 'RdYlBu',
        label: 'Red-Yellow-Blue',
        groupKey: 'diverging',
    },
    {
        key: 'RdYlGn',
        label: 'Red-Yellow-Green',
        groupKey: 'diverging',
    },
    {
        key: 'Spectral',
        label: 'Spectral',
        groupKey: 'diverging',
    },
];

const colorKeySelector = (item: ColorItem) => item.key;
const colorLabelSelector = (item: ColorItem) => item.label;
const colorGroupKeySelector = (item: ColorItem) => item.groupKey;

function colorOptionRenderer(item: ColorItem) {
    const {
        key,
        label,
    } = item;

    const scaleFn = d3ColorScale[`interpolate${key}`];

    const startColor = scaleFn(0);
    const midColor = scaleFn(0.5);
    const endColor = scaleFn(1);

    return (
        <div className={styles.option}>
            <div
                className={styles.preview}
                style={{
                    background: `linear-gradient(to right, ${startColor}, ${midColor}, ${endColor})`,
                }}
            />
            <div>
                {label}
            </div>
        </div>
    );
}

interface Props<NAME extends string> {
    name: NAME;
    value: string | undefined;
    onChange: (newVal: string | undefined, name: NAME) => void;
    error?: string;
}

function ColorSchemeInput<NAME extends string>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        error,
    } = props;

    const getGroupLabel = useCallback((groupKey: string) => (
        dataSeriesGroupMap.find((item) => item.key === groupKey)?.label ?? ''
    ), []);

    return (
        <SelectInput
            name={name}
            options={colorOptions}
            label="Color Scheme"
            keySelector={colorKeySelector}
            labelSelector={colorLabelSelector}
            optionLabelSelector={colorOptionRenderer}
            value={value}
            onChange={onChange}
            grouped
            groupKeySelector={colorGroupKeySelector}
            groupLabelSelector={(item) => getGroupLabel(item.groupKey)}
            error={error}
        />
    );
}

export default ColorSchemeInput;
