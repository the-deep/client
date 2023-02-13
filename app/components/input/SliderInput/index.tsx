import React, { useMemo } from 'react';
import ReactSlider, { ReactSliderProps } from 'react-slider';
import {
    Element,
    Heading,
} from '@the-deep/deep-ui';

import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

type RenderMarkFn = NonNullable<ReactSliderProps<number | readonly number[]>['renderMark']>;
type RenderThumbFn = NonNullable<ReactSliderProps<number | readonly number[]>['renderThumb']>;
type RenderTrackFn = NonNullable<ReactSliderProps<number | readonly number[]>['renderTrack']>;

// eslint-disable-next-line react/function-component-definition
const Mark: RenderMarkFn = (props) => (
    <span
        {...props}
        className={styles.mark}
    />
);

// eslint-disable-next-line react/function-component-definition
const Thumb: RenderThumbFn = (props) => (
    <div
        {...props}
        className={styles.thumb}
    />
);

// eslint-disable-next-line react/function-component-definition
const Track: RenderTrackFn = (props) => (
    <div
        {...props}
        // index={index}
        className={styles.track}
    />
);

interface Props<T extends number | number[]> {
    className?: string;
    min: number;
    max: number;
    value: T;
    onChange: (value: T) => void;
    step: number;
    minDistance: number;
    hideValues?: boolean;
    hideMarks?: boolean;
    label?: string;
}

function Slider<T extends number | number[]>(props: Props<T>) {
    const {
        min,
        max,
        className,
        value,
        onChange,
        step,
        label,
        minDistance,
        hideValues,
        hideMarks,
    } = props;

    const marks = useMemo(() => (Array.from(
        { length: max - min + 1 },
        (_, i) => i + min,
    )), [max, min]);

    return (
        <Element
            icons={<Heading size="extraSmall">{label}</Heading>}
            className={_cs(styles.slider, className)}
        >
            {typeof value !== 'number' && !hideValues && (
                <div>
                    {value[0]}
                </div>
            )}
            <ReactSlider
                className={styles.reactSlider}
                min={min}
                max={max}
                step={step}
                marks={hideMarks ? undefined : marks}
                minDistance={minDistance}
                pearling
                value={value}
                onChange={onChange}
                renderMark={Mark}
                renderThumb={Thumb}
                renderTrack={Track}
            />
            {typeof value !== 'number' && !hideValues && (
                <div>
                    {value[1]}
                </div>
            )}
        </Element>
    );
}

export default Slider;
