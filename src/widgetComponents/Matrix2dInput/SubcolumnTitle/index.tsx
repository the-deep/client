import React from 'react';
import memoize from 'memoize-one';

import styles from './styles.scss';

type OrientationKey = 'leftToRight' | 'bottomToTop';
interface Orientation {
    key: OrientationKey;
    label: string;
}

interface StyleType {
    fontSize?: string;
    wiritingMode?: string;
    width?: number | string;
    height?: number | string;
    transform?: string;
    display?: string;
    alignItems?: string;
    justifyContent?: string;
    writingMode?: string;
}

interface Props {
    fontSize?: string | undefined;
    width?: string | undefined;
    title?: string | undefined;
    tooltip?: string | undefined;
    className?: string | undefined;
    orientation?: Orientation;
    sectorKey?: string | undefined;
    onClick?: (x: string | undefined) => {};
}

interface State {
}

export default class SubsectorTitle extends React.PureComponent<Props, State> {
    private getCellStyle = memoize((
        fontSize: string | undefined,
        orientation: OrientationKey,
        width: string | undefined,
    ) => {
        const style: StyleType = {};
        const tdStyle: StyleType = {};

        if (fontSize) {
            style.fontSize = `${fontSize}px`;
        }

        if (orientation === 'bottomToTop') {
            style.writingMode = 'vertical-rl';
            tdStyle.width = 0;
            tdStyle.height = 0;
            style.transform = 'rotate(180deg)';
            style.width = '100%';
            style.height = '100%';
            style.display = 'flex';
            style.alignItems = 'center';
            style.justifyContent = 'center';
        } else {
            style.display = 'flex';
            style.alignItems = 'center';
            style.justifyContent = 'center';
        }

        if (width) {
            style.width = `${width}px`;
        }

        return {
            style,
            tdStyle,
        };
    })

    render() {
        const {
            fontSize,
            orientation,
            title,
            tooltip,
            width,
        } = this.props;

        const {
            style,
            tdStyle,
        } = this.getCellStyle(fontSize, orientation, width);

        return (
            <th
                title={tooltip}
                style={tdStyle}
            >
                <div style={style}>
                    <div className={styles.title}>
                        {title}
                    </div>
                </div>
            </th>
        );
    }
}
