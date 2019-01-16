import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import Searchable from '#rscv/Taebul/Searchable';
import Sortable from '#rscv/Taebul/Sortable';
import ColumnWidth from '#rscv/Taebul/ColumnWidth';
import NormalTaebul from '#rscv/Taebul';
import {
    compareString,
    compareNumber,
    compareDate,
    caseInsensitiveSubmatch,
} from '#rsu/common';
import _cs from '#cs';

import Header from './Header';
import {
    StringCell,
    NumberCell,
    DateCell,
    handleInvalid,
} from './renderers';

import styles from './styles.scss';

const Taebul = Searchable(Sortable(ColumnWidth(NormalTaebul)));

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
    geo: StringCell,
    number: handleInvalid(NumberCell),
    datetime: handleInvalid(DateCell),
};

export default class TabularSheet extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = datum => datum.key;

    calcSheetSettings = memoize((columns, options = {}) => {
        const settings = {
            ...options,
            columnWidths: { ...options.columnWidths },
            searchTerm: { ...options.searchTerm },
        };

        columns.forEach((column) => {
            if (settings.columnWidths[column.key] === undefined) {
                settings.columnWidths[column.key] = 200;
            }
            if (settings.searchTerm[column.key] === undefined) {
                settings.searchTerm[column.key] = '';
            }
        });

        return settings;
    });

    calcSheetColumns = memoize((fields = []) => (
        fields
            .map(field => ({
                ...field,
                id: String(field.id),
            }))
            .map(field => ({
                key: field.id,
                value: field,

                headerRendererParams: this.headerRendererParams,
                headerRenderer: Header,
                cellRendererParams: this.cellRendererParams,

                cellRenderer: renderers[field.type] || renderers.string,
                comparator: (a, b, d) => comparators[field.type](
                    a[field.id].value, b[field.id].value, d,
                ),
            }))
    ))

    handleColumnChange = (key, value) => {
        // FIXME: use immutable-helpers
        const { sheet } = this.props;
        const newSheet = {
            ...sheet,
            fields: [...sheet.fields],
        };

        const index = newSheet.fields.findIndex(c => String(c.id) === key);
        newSheet.fields[index] = {
            ...sheet.fields[index],
            ...value,
        };

        this.props.onSheetChange(sheet);
    }

    handleSettingsChange = (settings) => {
        this.props.onSheetChange({
            ...this.props.sheet,
            options: settings,
        });
    }

    handleSearch = (datum, searchTerm) => {
        const { sheet } = this.props;
        const sheetColumns = this.calcSheetColumns(sheet.fields);
        return sheetColumns.every((sheetColumn) => {
            const columnKey = sheetColumn.key;
            const searchTermForColumn = searchTerm[columnKey];
            const datumForColumn = datum[columnKey];
            if (searchTermForColumn === undefined || searchTermForColumn === null) {
                return true;
            }
            // NOTE: check for datum.type
            return caseInsensitiveSubmatch(datumForColumn.value, searchTermForColumn);
        });
    };

    headerRendererParams = ({ column, columnKey, data }) => {
        const validCount = data.filter(x => x[columnKey].type === column.value.type).length;

        return {
            columnKey,
            onChange: this.handleColumnChange,
            value: column.value,
            sortOrder: column.sortOrder,
            onSortClick: column.onSortClick,
            className: styles.header,
            // FIXME: shouldn't create objects on the fly
            statusData: [validCount, data.length - validCount],
        };
    }

    cellRendererParams = ({ datum, column: { value: { type, id, options } } }) => ({
        className: _cs(styles[type], styles.cell),
        value: datum[id].value,
        options,
        invalid: type !== 'string' && datum[id].type !== type,
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
                searchFunction={this.handleSearch}
            />
        );
    }
}
