import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import { getRgbFromHex } from '#rsu/common';
import HealthBar from '#rscz/HealthBar';

import _cs from '#cs';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    fieldId: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    column: PropTypes.arrayOf(PropTypes.object).isRequired,
    options: PropTypes.shape({}),
    color: PropTypes.string,
    leadKey: PropTypes.string,
    onClick: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    color: undefined,
    leadKey: undefined,
    options: undefined,
};

const healthColorScheme = [
    '#41cf76',
    '#f44336',
    '#dddddd',
];

const valueSelector = x => x.value;
const keySelector = x => x.key;

export default class Field extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static dataKeySelector = d => d.key;

    getHealthStatusData = memoize((data) => {
        const invalidCount = data.filter(x => x.invalid).length;
        const emptyCount = data.filter(x => x.empty).length;
        const totalCount = data.length;

        return [
            {
                key: 'valid',
                value: totalCount - emptyCount - invalidCount,
            },
            {
                key: 'invalid',
                value: invalidCount,
            },
            {
                key: 'empty',
                value: emptyCount,
            },
        ];
    });


    handleOnDragStart = (e) => {
        const {
            title,
            type,
            column,
            options,
            fieldId,
        } = this.props;
        const data = JSON.stringify({
            type: 'dataSeries',
            data: {
                fieldId,
                title,
                type,
                data: column,
                options,
            },
        });
        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.dropEffect = 'copy';
    }

    handleClick = (e) => {
        const {
            leadKey,
            onClick,
        } = this.props;
        if (!leadKey) {
            return;
        }
        onClick(e, { key: leadKey });
    }

    render() {
        const {
            className,
            title,
            column,
            color,
            leadKey,
        } = this.props;

        const healthStatusData = this.getHealthStatusData(column);

        let style;
        if (color) {
            const { r, g, b } = getRgbFromHex(color);
            const backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
            style = { backgroundColor };
        }

        return (
            <div
                className={_cs(className, styles.field)}
                onDragStart={this.handleOnDragStart}
                draggable={!leadKey}
                role="button"
                tabIndex="-1"
                style={style}
                onClick={this.handleClick}
                onKeyDown={this.handleClick}
            >
                <h5>
                    {title}
                </h5>
                <HealthBar
                    className={styles.healthBar}
                    data={healthStatusData}
                    valueSelector={valueSelector}
                    keySelector={keySelector}
                    colorScheme={healthColorScheme}
                    enlargeOnHover={false}
                    hideLabel
                />
            </div>
        );
    }
}
