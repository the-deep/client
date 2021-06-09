import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { getRgbRawFromHex } from '@togglecorp/fujs';

import HealthBar from '#rscz/HealthBar';

import DataSeries from '#components/viz/DataSeries';

import _cs from '#cs';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    fieldId: PropTypes.number.isRequired,
    // title: PropTypes.string.isRequired,
    // type: PropTypes.string.isRequired,
    healthStats: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    options: PropTypes.shape({}),
    color: PropTypes.string,
    leadKey: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    showGraphs: PropTypes.bool.isRequired,

    onFieldStateChange: PropTypes.func,
    tabularFieldData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    fieldState: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    color: undefined,
    leadKey: undefined,
    options: undefined,
    healthStats: {},
    onFieldStateChange: undefined,
    tabularFieldData: undefined,
    fieldState: undefined,
};

const healthColorScheme = [
    '#41cf76',
    '#f44336',
    '#ef8c00',
];

const valueSelector = x => x.value;
const keySelector = x => x.key;
const labelSelector = keySelector;

export default class Field extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static dataKeySelector = d => d.key;

    getHealthStatusData = memoize(data => ([
        {
            key: 'valid',
            value: data.total - data.empty - data.invalid,
        },
        {
            key: 'invalid',
            value: data.invalid,
        },
        {
            key: 'empty',
            value: data.empty,
        },
    ]))


    handleOnDragStart = (e) => {
        const {
            /*
            title,
            type,
            column,
            options,
            */
            fieldId,
        } = this.props;
        const data = JSON.stringify({
            type: 'dataSeries',
            data: fieldId,
            /*
            data: {
                fieldId,
                title,
                type,
                data: column,
                options,
            },
            */
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

    handleFieldStateChange = (value) => {
        const {
            onFieldStateChange,
            fieldId,
        } = this.props;
        onFieldStateChange(fieldId, value);
    }

    render() {
        const {
            className,
            healthStats,
            color,
            leadKey,
            // title,
            tabularFieldData,
            showGraphs,
            fieldState,
        } = this.props;

        const healthStatusData = this.getHealthStatusData(healthStats);

        let style;
        if (color) {
            const [r, g, b] = getRgbRawFromHex(color);
            const borderColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
            style = {
                borderLeft: `8px solid ${borderColor}`,
            };
        } else {
            style = {
                borderLeft: '8px solid transparent',
            };
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
                <DataSeries
                    className={_cs(showGraphs && styles.series)}
                    value={tabularFieldData}
                    onEntryStateChange={this.handleFieldStateChange}
                    entryState={fieldState}
                    hideDetails={!showGraphs}
                />
                { showGraphs &&
                    <HealthBar
                        className={styles.healthBar}
                        data={healthStatusData}
                        valueSelector={valueSelector}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        centerTooltip
                        colorScheme={healthColorScheme}
                        enlargeOnHover={false}
                        hideLabel
                    />
                }
            </div>
        );
    }
}
