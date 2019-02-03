import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';
import Searchable from '#rscv/Taebul/Searchable';
import Sortable from '#rscv/Taebul/Sortable';
import ColumnWidth from '#rscv/Taebul/ColumnWidth';
import NormalTaebul from '#rscv/Taebul';
import {
    compareString,
    compareNumber,
    compareDate,
    caseInsensitiveSubmatch,
    isFalsyString,
    isTruthyString,
} from '#rsu/common';
import update from '#rsu/immutable-update';
import _cs from '#cs';
import _ts from '#ts';

import { iconNames } from '#constants';
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

const propTypes = {
    className: PropTypes.string,
    sheet: PropTypes.shape({
        fields: PropTypes.array,
        rows: PropTypes.array,
        options: PropTypes.object,
    }),
    sheetId: PropTypes.number.isRequired,
    onSheetOptionsChange: PropTypes.func.isRequired,
    onFieldRetrieve: PropTypes.func.isRequired,
    onFieldDelete: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    isFieldRetrievePending: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    fieldDeletePending: PropTypes.object.isRequired,
    // onSheetChange: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    sheet: {},
    disabled: false,
    isFieldRetrievePending: false,
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

// FIXME: memoize this
const getDeletedFields = fields => fields.filter(f => f.hidden);

export default class Sheet extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = datum => datum.key;

    getFilterCriteria = (datum, searchTerm = emptyObject) => {
        const { sheet } = this.props;
        const { fields, options: { searchTerm: oldSearchTerm } = {} } = sheet;

        const columns = this.getSheetColumns(fields, oldSearchTerm);
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

            if (type === DATA_TYPE.number) {
                const { from, to } = searchTermForColumn;
                if (empty || invalid) {
                    return isFalsyString(from) && isFalsyString(to);
                }
                return (
                    ((isFalsyString(from) && isFalsyString(to)) || isTruthyString(value)) &&
                    (isFalsyString(from) || parseFloat(value) >= parseFloat(from)) &&
                    (isFalsyString(to) || parseFloat(value) <= parseFloat(to))
                );
            } else if (type === DATA_TYPE.datetime) {
                const { from, to } = searchTermForColumn;
                if (empty || invalid) {
                    return isFalsyString(from) && isFalsyString(to);
                }
                return (
                    ((isFalsyString(from) && isFalsyString(to)) || isTruthyString(value)) &&
                    (isFalsyString(from) || new Date(value) >= new Date(from)) &&
                    (isFalsyString(to) || new Date(value) <= new Date(to))
                );
            }
            // NOTE: we can do normal string search for other types
            if (empty) {
                return isFalsyString(searchTermForColumn);
            }
            return caseInsensitiveSubmatch(value, searchTermForColumn);
        });
    };

    // NOTE: searchTerm, healthBar is used inside this.headerRendererParams
    // eslint-disable-next-line no-unused-vars
    getSheetColumns = memoize((fields, searchTerm, fieldStats, fieldDeletePending) => (
        fields
            .filter(field => !field.hidden)
            .map(field => ({
                key: String(field.id),
                value: field,

                headerRendererParams: this.headerRendererParams,
                cellRendererParams: this.cellRendererParams,

                headerRenderer: Header,
                cellRenderer: renderers[field.type] || renderers[DATA_TYPE.string],

                comparator: (a, b, d = 1) => comparators[field.type](
                    a[field.id].invalid || a[field.id].empty ? undefined : a[field.id].value,
                    b[field.id].invalid || b[field.id].empty ? undefined : b[field.id].value,
                    d,
                ),
            }))
    ));

    cellRendererParams = ({ datum, column: { value: { type, id, options } } }) => ({
        className: _cs(styles[type], styles.cell),
        value: datum[id].value,
        invalid: datum[id].invalid,
        empty: datum[id].empty,
        options,
    })

    headerRendererParams = ({ column, columnKey }) => {
        // NOTE: columnKey was taken from rendererParams, so it is a strina
        const fieldId = Number(columnKey);

        const {
            sheet: {
                options: {
                    searchTerm = {},
                } = {},
                fieldsStats: {
                    [fieldId]: {
                        healthBar,
                    },
                },
            },
        } = this.props;


        const isFieldDeletePending = this.props.fieldDeletePending[fieldId];

        return {
            fieldId,

            disabled: this.props.disabled || isFieldDeletePending,

            onChange: this.handleFieldValueChange,
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
            isFieldDeletePending,
        };
    }

    handleFieldValueChange = (key, value) => {
        const { sheet } = this.props;
        const index = sheet.fields.findIndex(c => String(c.id) === key);
        const settings = {
            fields: {
                [index]: { $merge: value },
            },
        };
        const newSheet = update(sheet, settings);
        console.warn('TODO: Should change sheet', newSheet);
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

    render() {
        const {
            className,
            sheet,
            disabled,
            isFieldRetrievePending,
            fieldDeletePending,
        } = this.props;
        const {
            fields,
            options: { searchTerm } = {},
            fieldsStats,
        } = sheet;
        const columns = this.getSheetColumns(fields, searchTerm, fieldsStats, fieldDeletePending);

        const fieldList = getDeletedFields(fields);

        return (
            <div className={_cs(className, styles.tabularSheet, 'tabular-sheet')}>
                <div className={styles.optionsBar}>
                    <ModalButton
                        iconName={iconNames.more}
                        title="Other Sheets"
                        disabled={disabled || fieldList.length <= 0}
                        pending={isFieldRetrievePending}
                        modal={
                            <FieldRetrieveModal
                                disabled={disabled}
                                fields={fieldList}
                                onFieldRetrieve={this.handleFieldRetrieve}
                            />
                        }
                    />
                    <Button
                        iconName={iconNames.sort}
                        onClick={this.handleResetSort}
                        disabled={disabled}
                        title={_ts('tabular', 'resetSortLabel')}
                    />
                </div>
                <Taebul
                    className={styles.table}
                    data={sheet.rows}
                    settings={sheet.options}
                    keySelector={Sheet.keySelector}
                    columns={columns}
                    onChange={this.handleSettingsChange}
                    searchFunction={this.getFilterCriteria}
                />
            </div>
        );
    }
}
