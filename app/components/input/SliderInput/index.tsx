import React, { RefCallback, HTMLProps } from 'react';
import ReactSlider from 'react-slider';
import {
    Element,
    Heading,
} from '@the-deep/deep-ui';

import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface HTMLPropsWithRefCallback<T> extends HTMLProps<T> {
    ref: RefCallback<T>;
}

function Mark(
    props: HTMLPropsWithRefCallback<HTMLSpanElement>,
) {
    return (
        <span
            {...props}
            className={styles.mark}
        />
    );
}

interface HTMLPropsWithRefCallback<T> extends HTMLProps<T> {
    ref: RefCallback<T>;
}

function Thumb(
    props: HTMLPropsWithRefCallback<HTMLSpanElement>,
) {
    return (
        <div
            {...props}
            className={styles.thumb}
        />
    );
}

function Track<T extends number | number[]>(
    props: HTMLPropsWithRefCallback<HTMLSpanElement>,
    state: { index: number; value: T },
) {
    const { index } = state;
    return (
        <div
            {...props}
            // index={index}
            className={_cs(
                styles.track,
                index === 1 && styles.center,
            )}
        />
    );
}

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

    const marks = Array.from(
        { length: max - min + 1 },
        (_, i) => i + min,
    );

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
                renderThumb={Thumb}
                renderTrack={Track}
                renderMark={Mark}
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
