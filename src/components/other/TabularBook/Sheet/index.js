import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import { isValidDateString } from '#rsci/DateInput';
import Numeral from '#rscv/Numeral';
import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';
import Searchable from '#rscv/Taebul/Searchable';
import Sortable from '#rscv/Taebul/Sortable';
import ColumnWidth from '#rscv/Taebul/ColumnWidth';
import NormalTaebul from '#rscv/Taebul';
import Message from '#rscv/Message';

import noDataIcon from '#resources/img/no-search.png';
import noFilterDataIcon from '#resources/img/no-filter.png';

import {
    compareString,
    compareNumber,
    compareDate,
    caseInsensitiveSubmatch,
    isFalsyString as isFalsyStr,
    isTruthyString as isTruthyStr,
    isDefined,
    doesObjectHaveNoData,
    listToMap,
} from '@togglecorp/fujs';
import update from '#rsu/immutable-update';
import _cs from '#cs';
import _ts from '#ts';

import Cloak from '#components/general/Cloak';
import { DATA_TYPE } from '#entities/tabular';

import FieldRetrieveModal from './FieldRetrieveModal';
import Header from './Header';

import { handleInvalidCell } from './renderers';
import StringCell from './renderers/StringCell';
import NumberCell from './renderers/NumberCell';
import DateCell from './renderers/DateCell';

import StringFilter from './filters/StringFilter';
import NumberFilter from './filters/NumberFilter';
import DateFilter from './filters/DateFilter';

import styles from './styles.scss';

const ModalButton = modalize(Button);

const Taebul = Searchable(Sortable(ColumnWidth(NormalTaebul)));

const isFalsyDate = val => isFalsyStr(val) || !isValidDateString(val);

const getFieldStat = (value) => {
    const invalidCount = value.filter(x => x.invalid).length;
    const emptyCount = value.filter(x => x.empty).length;
    const totalCount = value.length;
    return {
        healthBar: [
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
        ],
    };
};

const propTypes = {
    className: PropTypes.string,
    sheet: PropTypes.shape({
        fields: PropTypes.array,
        rows: PropTypes.array,
        options: PropTypes.object,
    }),
    sheetId: PropTypes.number.isRequired,
    projectRegions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onSheetOptionsChange: PropTypes.func.isRequired,
    onFieldRetrieve: PropTypes.func.isRequired,
    onFieldDelete: PropTypes.func.isRequired,
    onFieldEdit: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    isFieldRetrievePending: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    fieldDeletePending: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    fieldEditPending: PropTypes.object.isRequired,
    // onSheetChange: PropTypes.func.isRequired,
    viewMode: PropTypes.bool,
};

const defaultProps = {
    className: '',
    sheet: {},
    disabled: false,
    isFieldRetrievePending: false,
    viewMode: false,
    projectRegions: {},
};

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

export default class Sheet extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = datum => datum.key;

    static getValueByType = (type, obj) => {
        if (type === DATA_TYPE.number || type === DATA_TYPE.datetime) {
            return obj.processedValue;
        }
        return obj.value;
    }

    getSlicedRows = memoize((rows, dataRowIndex) => (
        isDefined(dataRowIndex) && dataRowIndex >= 0
            ? rows.slice(dataRowIndex, rows.length)
            : rows
    ))

    getFieldStats = memoize((fields, rows) => (
        listToMap(
            fields,
            field => field.id,
            (field) => {
                const columnData = rows.map(row => row[field.id]);
                return getFieldStat(columnData);
            },
        )
    ))

    getDeletedFields = memoize(fields => (
        fields.filter(f => f.hidden)
    ))

    getFieldsCount = memoize(fields => (
        fields.filter(field => !field.hidden).length
    ))

    getFilterCriteria = (datum, searchTerm = emptyObject) => {
        const {
            sheet,
            /*
            viewMode,
            projectRegions,
            */
        } = this.props;
        const {
            fields,
            /*
            options: {
                searchTerm: oldSearchTerm,
                dataRowIndex: oldDataRowIndex,
            } = {},
            fieldDeletePending,
            fieldEditPending,
            */
        } = sheet;

        const columns = this.getSheetColumns(
            fields,
            /*
            fieldDeletePending,
            fieldEditPending,
            viewMode,
            projectRegions,
            oldSearchTerm,
            oldDataRowIndex,
            */
        );

        return columns.every((sheetColumn) => {
            const {
                key: columnKey,
                value: {
                    type,
                },
            } = sheetColumn;

            const { value, empty, invalid } = datum[columnKey];

            const searchTermForColumn = searchTerm[columnKey];
            if (searchTermForColumn === undefined) {
                return true;
            }

            const { type: searchTermType } = searchTermForColumn;

            if (searchTermType === DATA_TYPE.number && type === DATA_TYPE.number) {
                const { numberFrom, numberTo } = searchTermForColumn;
                if (empty || invalid) {
                    return isFalsyStr(numberFrom) && isFalsyStr(numberTo);
                }
                return (
                    ((isFalsyStr(numberFrom) && isFalsyStr(numberTo)) || isTruthyStr(value)) &&
                    (isFalsyStr(numberFrom) || parseFloat(value) >= parseFloat(numberFrom)) &&
                    (isFalsyStr(numberTo) || parseFloat(value) <= parseFloat(numberTo))
                );
            } else if (searchTermType === DATA_TYPE.datetime && type === DATA_TYPE.datetime) {
                const { dateFrom, dateTo } = searchTermForColumn;
                if (empty || invalid) {
                    return isFalsyDate(dateFrom) && isFalsyDate(dateTo);
                }
                return (
                    ((isFalsyDate(dateFrom) && isFalsyDate(dateTo)) || isTruthyStr(value)) &&
                    (isFalsyDate(dateFrom) || new Date(value) >= new Date(dateFrom)) &&
                    (isFalsyDate(dateTo) || new Date(value) <= new Date(dateTo))
                );
            } else if (
                (searchTermType === DATA_TYPE.string || searchTermType === DATA_TYPE.geo) &&
                (type === DATA_TYPE.string || type === DATA_TYPE.geo)
            ) {
                // NOTE: we can do normal string search for other types
                const { text } = searchTermForColumn;
                if (empty) {
                    return isFalsyStr(text);
                }
                return caseInsensitiveSubmatch(value, text);
            }

            // else don't apply filter
            return true;
        });
    }

    // NOTE: searchTerm, projectRegions is used inside this.headerRendererParams
    getSheetColumns = memoize(fields => (
        fields
            .filter(field => !field.hidden)
            .map(field => ({
                key: String(field.id),
                value: field,

                headerRendererParams: this.headerRendererParams,
                cellRendererParams: this.cellRendererParams,

                headerRenderer: Header,
                cellRenderer: renderers[field.type] || renderers[DATA_TYPE.string],

                comparator: (a, b, d = 1) => {
                    const foo = a[field.id];
                    const bar = b[field.id];

                    return comparators[field.type](
                        (!foo.invalid && !foo.empty)
                            ? Sheet.getValueByType(field.type, foo)
                            : undefined,
                        (!bar.invalid && !bar.empty)
                            ? Sheet.getValueByType(field.type, bar)
                            : undefined,
                        d,
                    );
                },
            }))
    ))

    shouldHideEditButton = ({ leadPermissions }) => (
        this.props.viewMode || !leadPermissions.modify
    )

    cellRendererParams = ({ datum, column: { value: { type, id /* , options */ } } }) => ({
        className: _cs(styles[type], styles.cell),
        value: (!datum[id].invalid && !datum[id].empty)
            ? Sheet.getValueByType(type, datum[id])
            : datum[id].value,
        invalid: datum[id].invalid,
        empty: datum[id].empty,
        // options,
    })

    headerRendererParams = ({ column, columnKey }) => {
        // NOTE: columnKey was taken from rendererParams, so it is a strina
        const fieldId = Number(columnKey);

        const {
            disabled,
            sheet,
            projectRegions,
            fieldDeletePending,
            fieldEditPending,
            viewMode,
            highlights,
        } = this.props;

        const {
            options: {
                searchTerm = {},
            } = {},
            fields,
            rows,
            dataRowIndex,
        } = sheet;

        const isFieldDeletePending = fieldDeletePending[fieldId];
        const isFieldEditPending = fieldEditPending[fieldId];
        const fieldsCount = this.getFieldsCount(fields);

        const slicedRows = this.getSlicedRows(rows, dataRowIndex);

        const fieldStats = this.getFieldStats(fields, slicedRows);
        const { healthBar } = fieldStats[fieldId];

        // const headerRow = rows[dataRowIndex - 1];
        // const headerTitle = headerRow ? headerRow[fieldId].value : undefined;

        return {
            fieldId,

            disabled: disabled || isFieldDeletePending || isFieldEditPending,
            disabledDelete: fieldsCount <= 1,

            onFilterChange: this.handleFilterChange,

            value: column.value,
            sortOrder: column.sortOrder,
            onSortClick: column.onSortClick,
            className: styles.header,
            statusData: healthBar,
            filterValue: searchTerm[fieldId],
            filterComponent: (
                filterRenderers[column.value.type] || filterRenderers[DATA_TYPE.string]
            ),
            onFieldDelete: this.handleFieldDelete,
            onFieldEdit: this.handleFieldEdit,
            isFieldDeletePending,
            isFieldEditPending,
            viewMode,
            projectRegions,
            highlight: highlights[fieldId],
        };
    }

    handleFilterChange = (key, value) => {
        const {
            sheet: {
                options: oldOptions = {},
            },
            sheetId,
            onSheetOptionsChange,
        } = this.props;

        const settings = {
            searchTerm: { $auto: {
                [key]: { $set: value },
            } },
        };
        const newOptions = update(oldOptions, settings);
        onSheetOptionsChange(sheetId, newOptions);
    }

    handleResetFilter = () => {
        const {
            sheet: {
                options: oldOptions = {},
            },
            sheetId,
            onSheetOptionsChange,
        } = this.props;

        const settings = {
            searchTerm: { $set: undefined },
        };
        const newOptions = update(oldOptions, settings);
        onSheetOptionsChange(sheetId, newOptions);
    }

    handleResetSort = () => {
        const {
            sheet: {
                options: oldOptions = {},
            },
            sheetId,
            onSheetOptionsChange,
        } = this.props;

        const settings = {
            sortOrder: { $set: undefined },
        };
        const newOptions = update(oldOptions, settings);
        onSheetOptionsChange(sheetId, newOptions);
    }

    handleFieldRetrieve = (selectedFields) => {
        const {
            onFieldRetrieve,
            sheetId,
        } = this.props;
        onFieldRetrieve(sheetId, selectedFields);
    }

    handleFieldEdit = (fieldId, value) => {
        const {
            onFieldEdit,
            sheetId,
        } = this.props;
        onFieldEdit(sheetId, fieldId, value);
    }

    handleFieldDelete = (fieldId) => {
        const {
            onFieldDelete,
            sheetId,
        } = this.props;
        onFieldDelete(sheetId, fieldId);
    }

    handleSettingsChange = (options) => {
        const {
            sheetId,
            onSheetOptionsChange,
        } = this.props;
        onSheetOptionsChange(sheetId, options);
    }

    renderEmptyComponent = () => {
        const {
            sheet,
        } = this.props;

        const {
            rows,
            options: {
                searchTerm = {},
            } = {},
        } = sheet;

        const hasFilterText = !doesObjectHaveNoData(searchTerm);
        const isFilterEmpty = hasFilterText && rows.length !== 0;

        return (
            <Message className={styles.empty}>
                <img
                    className={styles.image}
                    src={isFilterEmpty ? noFilterDataIcon : noDataIcon}
                    alt="x"
                />
                { isFilterEmpty ? (
                    _ts('tabular.sheets', 'filterEmptyMessage')
                ) : (
                    _ts('tabular.sheets', 'tabularEmptyMessage')
                )}
            </Message>
        );
    }

    render() {
        const {
            className,
            sheet: {
                rows,
                dataRowIndex,
                options = emptyObject,
                fields,
                // fieldsStats,
            },
            disabled,
            isFieldRetrievePending,
            /*
            fieldDeletePending,
            fieldEditPending,
            projectRegions,
            viewMode,
            */
        } = this.props;

        const { searchTerm, sortOrder } = options;

        const columns = this.getSheetColumns(
            fields,
            /*
            fieldsStats,
            fieldDeletePending,
            fieldEditPending,
            viewMode,
            projectRegions,
            searchTerm,
            dataRowIndex,
            */
        );

        const fieldList = this.getDeletedFields(fields);

        const slicedRows = this.getSlicedRows(rows, dataRowIndex);

        return (
            <div className={_cs(className, styles.tabularSheet, 'tabular-sheet')}>
                <div className={styles.optionsBar}>
                    <Cloak
                        hide={this.shouldHideEditButton}
                        render={
                            <ModalButton
                                iconName="more"
                                title={_ts('tabular.sheets', 'columnShowButtonTooltip')}
                                disabled={disabled || fieldList.length <= 0}
                                transparent
                                pending={isFieldRetrievePending}
                                modal={
                                    <FieldRetrieveModal
                                        disabled={disabled}
                                        fields={fieldList}
                                        onFieldRetrieve={this.handleFieldRetrieve}
                                    />
                                }
                            />
                        }
                    />
                    <Button
                        onClick={this.handleResetSort}
                        disabled={disabled || doesObjectHaveNoData(sortOrder)}
                        transparent
                    >
                        {_ts('tabular.sheets', 'resetSortTitle')}
                    </Button>
                    <Button
                        onClick={this.handleResetFilter}
                        disabled={disabled || doesObjectHaveNoData(searchTerm)}
                        transparent
                    >
                        {_ts('tabular.sheets', 'resetFilterTooltip')}
                    </Button>
                    <div className={styles.infoBar}>
                        <div className={styles.info}>
                            <Numeral
                                className={styles.value}
                                value={slicedRows.length}
                                precision={0}
                            />
                            <div className={styles.label}>
                                {/* FIXME: use strings */}
                                rows
                            </div>
                        </div>
                        <div className={styles.info}>
                            <Numeral
                                precision={0}
                                className={styles.value}
                                value={columns.length}
                            />
                            <div className={styles.label}>
                                {/* FIXME: use strings */}
                                columns
                            </div>
                        </div>
                    </div>
                </div>
                <Taebul
                    className={styles.table}
                    data={slicedRows}
                    settings={options}
                    keySelector={Sheet.keySelector}
                    columns={columns}
                    onChange={this.handleSettingsChange}
                    searchFunction={this.getFilterCriteria}
                    rowHeight={24}
                    emptyComponent={this.renderEmptyComponent}
                />
            </div>
        );
    }
}
