import React from 'react';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

type OrientationKey = 'leftToRight' | 'bottomToTop';
/*
interface Orientation {
    key: OrientationKey;
    label: string;
}
*/

/*
interface StyleType {
    fontSize?: string;
    // wiritingMode?: string;
    width?: number | string;
    height?: number | string;
    transform?: string;
    display?: string;
    alignItems?: string;
    justifyContent?: string;
    writingMode?: string;
}
*/

interface Props {
    fontSize?: string | undefined;
    width?: string | undefined;
    title?: string | undefined;
    tooltip?: string | undefined;
    className?: string | undefined;
    orientation?: OrientationKey;
    sectorKey?: string | undefined;
    onClick?: (x: string | undefined) => void;
}

interface State {
}

export default class SubsectorTitle extends React.PureComponent<Props, State> {
    private getCellStyle = memoize((
        fontSize: string | undefined,
        orientation: OrientationKey | undefined,
        width: string | undefined,
    ) => {
        const thStyle: React.CSSProperties = {};
        let thClassName;

        if (fontSize) {
            thStyle.fontSize = `${fontSize}px`;
        }

        if (width) {
            thStyle.width = `${width}px`;
        }

        if (orientation === 'bottomToTop') {
            thClassName = styles.rotated;
        }

        return {
            thClassName,
            thStyle,
        };
    })

    render() {
        const {
            fontSize,
            orientation,
            title,
            tooltip,
            width,
            className,
        } = this.props;

        const {
            thClassName,
            thStyle,
        } = this.getCellStyle(fontSize, orientation, width);

        return (
            <th
                title={tooltip}
                style={thStyle}
                className={_cs(
                    className,
                    styles.subcolumnTitleTh,
                    thClassName,
                )}
            >
                <div className={styles.subcolumnTitle}>
                    {title}
                </div>
            </th>
        );
    }
}
