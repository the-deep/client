import React from 'react';
import memoize from 'memoize-one';

interface Props {
}

interface State {
}

export default class SubsectorTitle extends React.PureComponent<Props, State> {
    private getCellStyle = memoize((fontSize, orientation, width) => {
        const style = {};
        const tdStyle = {};

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
                    {title}
                </div>
            </th>
        );
    }
}
