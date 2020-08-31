import React from 'react';
import SegmentInput from '#rsci/SegmentInput';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    label?: string;
    className?: string;
}

interface State {
}

interface Orientation {
    key: 'leftToRight' | 'bottomToTop' | 'default';
    label: 'A' | 'a' | 'auto';
}

const orientationOptions: Orientation[] = [
    { key: 'default', label: 'auto' },
    { key: 'leftToRight', label: 'A' },
    { key: 'bottomToTop', label: 'A' },
];

const OrientationInputItem = ({
    data,
}: { data: Orientation }) => (
    data.key === 'bottomToTop' ? (
        <div className={styles.rotatedText}>
            { data.label }
        </div>
    ) : data.label
);


export default class OrientationInput extends React.PureComponent<Props, State> {
    inputRendererParams = (key: number, data: Record<string, unknown>) => ({
        data,
    })

    render() {
        const {
            // FIXME: string
            label = 'Orientation',
            className,
            ...otherProps
        } = this.props;

        return (
            <SegmentInput
                {...otherProps}
                label={label}
                options={orientationOptions}
                renderer={OrientationInputItem}
                rendererParams={this.inputRendererParams}
                className={_cs(className, styles.orientationInput)}
            />
        );
    }
}
