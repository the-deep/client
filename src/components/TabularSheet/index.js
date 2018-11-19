import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import Sortable from '#rscv/Taebul/Sortable';
import ColumnWidth from '#rscv/Taebul/ColumnWidth';
import NormalTaebul from '#rscv/Taebul';
import { compareString, compareNumber, compareDate } from '#rsu/common';
import _cs from '#cs';

import { Header, StringCell, NumberCell, DateCell } from './renderers';

// eslint-disable-next-line css-modules/no-unused-class
import styles from './styles.scss';

const Taebul = Sortable(ColumnWidth(NormalTaebul));

const propTypes = {
    className: PropTypes.string,
    sheet: PropTypes.shape({
        fields: PropTypes.array,
        data: PropTypes.array,
        options: PropTypes.object,
    }),
    onSheetChange: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    sheet: {},
};

const comparators = {
    string: compareString,
    number: compareNumber,
    geo: compareString,
    datetime: compareDate,
};

const renderers = {
    string: StringCell,
    number: NumberCell,
    geo: StringCell,
    datetime: DateCell,
};

const stringifyId = d => ({
    ...d,
    id: String(d.id),
});

export default class TabularSheet extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = datum => datum.key;

    calcSheetSettings = memoize((columns, options = {}) => {
        const settings = { ...options };
        if (!settings.columnWidths) {
            settings.columnWidths = {};
        }

        columns.forEach((column) => {
            if (!settings.columnWidths[column.key]) {
                settings.columnWidths[column.key] = 200;
            }
        });

        return settings;
    });

    calcSheetColumns = memoize((fields = []) => (
        fields.map(stringifyId).map(this.createColumn)
    ))

    createColumn = field => ({
        key: field.id,
        value: field,

        headerRendererParams: this.headerRendererParams,
        headerRenderer: Header,
        cellRendererParams: this.cellRendererParams,

        cellRenderer: renderers[field.type],
        comparator: (a, b, d) => comparators[field.type](
            a[field.id], b[field.id], d,
        ),
    })

    handleColumnChange = (key, value) => {
        const sheet = { ...this.props.sheet };

        const fields = [...sheet.fields];
        const index = fields.findIndex(c => String(c.id) === key);
        fields[index] = { ...fields[index], ...value };

        sheet.fields = fields;
        this.props.onSheetChange(sheet);
    }

    handleSettingsChange = (settings) => {
        const sheet = { ...this.props.sheet };
        sheet.options = settings;
        this.props.onSheetChange(sheet);
    }

    headerRendererParams = ({ column, columnKey }) => ({
        columnKey,
        onChange: this.handleColumnChange,
        value: column.value,
        sortOrder: column.sortOrder,
        onSortClick: column.onSortClick,
    })

    cellRendererParams = ({ datum, column: { value: { type, id, options } } }) => ({
        className: _cs(styles[type], styles.cell),
        value: datum[id],
        options,
    })

    render() {
        const { className, sheet } = this.props;
        const sheetColumns = this.calcSheetColumns(sheet.fields);
        const sheetSettings = this.calcSheetSettings(sheetColumns, sheet.options);

        return (
            <Taebul
                className={_cs(className, styles.tabularSheet, 'tabular-sheet')}
                data={sheet.data}
                settings={sheetSettings}
                keySelector={TabularSheet.keySelector}
                columns={sheetColumns}
                onChange={this.handleSettingsChange}
            />
        );
    }
}
