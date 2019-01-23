import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import Searchable from '#rscv/Taebul/Searchable';
// import Selectable from '#rscv/Taebul/Selectable';
import Sortable from '#rscv/Taebul/Sortable';
import ColumnWidth from '#rscv/Taebul/ColumnWidth';
import NormalTaebul from '#rscv/Taebul';
import {
    compareString,
    compareNumber,
    compareDate,
    caseInsensitiveSubmatch,
    isDefined,
    isNotDefined,
} from '#rsu/common';
import update from '#rsu/immutable-update';
import _cs from '#cs';

import { DATA_TYPE } from '#entities/tabular';

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

// FIXME: don't use compareNumber as it is not exactly basic number type
// Try generating actual values which can be used for sorting
const comparators = {
    [DATA_TYPE.string]: compareString,
    [DATA_TYPE.number]: compareNumber,
    [DATA_TYPE.geo]: compareString,
    [DATA_TYPE.datetime]: compareDate,
};

const renderers = {
    [DATA_TYPE.string]: StringCell,
    [DATA_TYPE.geo]: StringCell,
    [DATA_TYPE.number]: handleInvalidCell(NumberCell),
    [DATA_TYPE.datetime]: handleInvalidCell(DateCell),
};

const filterRenderers = {
    [DATA_TYPE.string]: StringFilter,
    [DATA_TYPE.geo]: StringFilter,
    [DATA_TYPE.number]: NumberFilter,
    [DATA_TYPE.datetime]: DateFilter,
};

const emptyObject = {};

export default class TabularSheet extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = datum => datum.key;

    // NOTE: seachTerm is used inside this.headerRendererParams
    calcSheetColumns = memoize((fields, searchTerm) => (
        fields
            .filter(field => !field.hidden)
            .map(field => ({
                key: String(field.id),
                value: field,

                headerRendererParams: this.headerRendererParams,
                headerRenderer: Header,
                cellRendererParams: this.cellRendererParams,

                cellRenderer: renderers[field.type] || renderers[DATA_TYPE.string],
                comparator: (a, b, d = 1) => comparators[field.type](
                    a[field.id].type !== field.type ? undefined : a[field.id].value,
                    b[field.id].type !== field.type ? undefined : b[field.id].value,
                    d,
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
            filterComponent: (
                filterRenderers[column.value.type] || filterRenderers[DATA_TYPE.string]
            ),
        };
    }

    cellRendererParams = ({ datum, column: { value: { type, id, options } } }) => ({
        className: _cs(styles[type], styles.cell),
        value: datum[id].value,
        options,
        invalid: type !== DATA_TYPE.string && datum[id].type !== type,
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
            const {
                key: columnKey,
                value: {
                    type,
                },
            } = sheetColumn;

            const { value, type: valueType } = datum[columnKey];

            const searchTermForColumn = searchTerm[columnKey];
            if (searchTermForColumn === undefined) {
                return true;
            }

            // NOTE: string column type accepts all data types
            if (type !== DATA_TYPE.string && type !== valueType) {
                return false;
            }

            if (type === DATA_TYPE.number) {
                const { from, to } = searchTermForColumn;
                return (
                    ((isNotDefined(from) && isNotDefined(to)) || isDefined(value)) &&
                    (isNotDefined(from) || parseFloat(value) >= parseFloat(from)) &&
                    (isNotDefined(to) || parseFloat(value) <= parseFloat(to))
                );
            } else if (type === DATA_TYPE.datetime) {
                const { from, to } = searchTermForColumn;
                return (
                    ((isNotDefined(from) && isNotDefined(to)) || isDefined(value)) &&
                    (isNotDefined(from) || new Date(value) >= new Date(from)) &&
                    (isNotDefined(to) || new Date(value) <= new Date(to))
                );
            }

            return caseInsensitiveSubmatch(value, searchTermForColumn);
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
