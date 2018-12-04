import PropTypes from 'prop-types';
import React from 'react';

import ListView from '#rscv/List/ListView';

import styles from './styles.scss';

const Column = ({ columnData }) => (
    <div className={styles.col} >
        <span>
            {columnData.title}
        </span>
        <span>
            {columnData.value}
        </span>
    </div>
);

Column.propTypes = {
    columnData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const propTypes = {
    rowData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default class NumberMatrixOutputRow extends React.PureComponent {
    static propTypes = propTypes;

    static rowKeyExtractor = d => d.key;

    static columnRendererParams = (key, columnData) => ({
        columnData,
    });

    render() {
        const { rowData } = this.props;

        return (
            <div className={styles.row} >
                <span className={styles.rowTitle}>
                    {rowData.title}
                </span>
                <ListView
                    className={styles.colsContainer}
                    data={rowData.columns}
                    renderer={Column}
                    rendererParams={NumberMatrixOutputRow.columnRendererParams}
                    keySelector={NumberMatrixOutputRow.rowKeyExtractor}
                />
            </div>
        );
    }
}
