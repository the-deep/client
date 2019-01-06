import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import { getRgbFromHex } from '#rsu/common';

import ListView from '#rscv/List/ListView';
import _cs from '#cs';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    fieldId: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    options: PropTypes.shape({}),
    geodata: PropTypes.shape({}),
    color: PropTypes.string,
    leadKey: PropTypes.string,
    onClick: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    color: undefined,
    leadKey: undefined,
    geodata: undefined,
    options: undefined,
};

export default class Field extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static dataKeySelector = d => d.key;

    static calcSummarizedData = memoize((data) => {
        if (data.length <= 5) {
            return data;
        }
        const summary = data.slice(0, 5);
        return [
            ...summary,
            {
                key: 'ellipsis',
                value: '...',
            },
        ];
    })

    handleOnDragStart = (e) => {
        const {
            title,
            type,
            data: series,
            options,
            geodata,
            fieldId,
        } = this.props;
        const data = JSON.stringify({
            type: 'dataSeries',
            data: {
                fieldId,
                title,
                type,
                series,
                options,
                geodata,
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

    renderDataItem = ({ value }) => (
        <div className={styles.dataItem}>
            {value}
        </div>
    )

    renderDataParams = (key, dataItem) => ({
        ...dataItem,
    })

    render() {
        const {
            className,
            title,
            data,
            color,
            leadKey,
        } = this.props;

        let style;
        if (color) {
            const { r, g, b } = color ? getRgbFromHex(color) : {};
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
                <ListView
                    className={styles.dataItems}
                    keySelector={Field.dataKeySelector}
                    rendererParams={this.renderDataParams}
                    data={Field.calcSummarizedData(data)}
                    renderer={this.renderDataItem}
                />
            </div>
        );
    }
}
