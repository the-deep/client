import React from 'react';

export default function ModifiedLabel(props: {
    x?: number | string | undefined,
    y?: number | string | undefined,
    offset?: number | string | undefined,
    value?: string | number | undefined,
}) {
    const {
        x,
        y,
        offset,
        value,
    } = props;

    return (
        <text
            x={x}
            y={y}
            offset={offset}
            alignmentBaseline="before-edge"
        >
            {value}
        </text>
    );
}
