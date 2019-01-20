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
    isNotDefined,
} from '#rsu/common';
import update from '#rsu/immutable-update';
import _cs from '#cs';

import Header from './Header';
import { handleInvalidCell } from './renderers';
import StringCell from './renderers/StringCell';
import NumberCell from './renderers/NumberCell';
import DateCell from './renderers/DateCell';
import StringFilter from './filters/StringFilter';
import NumberFilter from './filters/NumberFilter';
import DateFilter from './filters/DateFilter';

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
    number: handleInvalidCell(NumberCell),
    datetime: handleInvalidCell(DateCell),
};

const filterRenderers = {
    string: StringFilter,
    geo: StringFilter,
    number: NumberFilter,
    datetime: DateFilter,
};

const emptyObject = {};

export default class TabularSheet extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = datum => datum.key;

    // NOTE: seachTerm is inside this.headerRendererParams
    calcSheetColumns = memoize((fields, searchTerm) => (
        fields
            .filter(field => !field.hidden)
            .map(field => ({
                key: String(field.id),
                value: field,

                headerRendererParams: this.headerRendererParams,
                headerRenderer: Header,
                cellRendererParams: this.cellRendererParams,

                cellRenderer: renderers[field.type] || renderers.string,
                comparator: (a, b, d) => comparators[field.type](
                    a[field.id].value, b[field.id].value, d,
                ),
            }))
    ));

    headerRendererParams = ({ column, columnKey, data = [] }) => {
        const validCount = data.filter(x => x[columnKey].type === column.value.type).length;

        const {
            sheet: {
                options: {
                    searchTerm = {},
                } = {},
            },
        } = this.props;

        return {
            columnKey,
            onChange: this.handleFieldValueChange,
            onFilterChange: this.handleFilterChange,
            value: column.value,
            sortOrder: column.sortOrder,
            onSortClick: column.onSortClick,
            className: styles.header,
            // FIXME: shouldn't create objects on the fly
            statusData: [validCount, data.length - validCount],
            filterValue: searchTerm[columnKey],
            filterComponent: filterRenderers[column.value.type] || filterRenderers.string,
        };
    }

    cellRendererParams = ({ datum, column: { value: { type, id, options } } }) => ({
        className: _cs(styles[type], styles.cell),
        value: datum[id].value,
        options,
        invalid: type !== 'string' && datum[id].type !== type,
    })

    handleFieldValueChange = (key, value) => {
        const { sheet } = this.props;
        const index = sheet.fields.findIndex(c => String(c.id) === key);
        const settings = {
            fields: {
                [index]: { $merge: value },
            },
        };
        const newSheet = update(sheet, settings);
        this.props.onSheetChange(newSheet);
    }

    handleFilterChange = (key, value) => {
        const { sheet } = this.props;
        const settings = {
            options: { $auto: {
                searchTerm: { $auto: {
                    [key]: { $set: value },
                } },
            } },
        };
        const newSheet = update(sheet, settings);
        this.props.onSheetChange(newSheet);
    }

    handleSettingsChange = (settings) => {
        this.props.onSheetChange({
            ...this.props.sheet,
            options: settings,
        });
    }

    handleSearch = (datum, searchTerm = emptyObject) => {
        const { sheet } = this.props;
        const { fields, options: { searchTerm: oldSearchTerm } = {} } = sheet;
        const columns = this.calcSheetColumns(fields, oldSearchTerm);

        return columns.every((sheetColumn) => {
            const columnKey = sheetColumn.key;
            const searchTermForColumn = searchTerm[columnKey];
            const datumForColumn = datum[columnKey];
            if (searchTermForColumn === undefined) {
                return true;
            }

            const { type } = sheetColumn.value;
            // TODO: cast to number
            // TODO: skip what is not a number
            if (type === 'number') {
                return (
                    (isNotDefined(searchTermForColumn.from)
                        || datumForColumn.value >= searchTermForColumn.from) &&
                    (isNotDefined(searchTermForColumn.to)
                        || datumForColumn.value <= searchTermForColumn.to)
                );
            }
            // TODO: comparision for date
            return caseInsensitiveSubmatch(datumForColumn.value, searchTermForColumn);
        });
    };

    render() {
        const { className, sheet } = this.props;
        const { fields, options: { searchTerm } = {} } = sheet;
        const columns = this.calcSheetColumns(fields, searchTerm);

        return (
            <Taebul
                className={_cs(className, styles.tabularSheet, 'tabular-sheet')}
                data={sheet.data}
                settings={sheet.options}
                keySelector={TabularSheet.keySelector}
                columns={columns}
                onChange={this.handleSettingsChange}
                searchFunction={this.handleSearch}
            />
        );
    }
}
