import { compareDate } from '@togglecorp/fujs';
import {
    DateOutputProps,
    TableCellProps,
    TableHeaderCellProps,
    DateOutput,
    TableColumn,
    TableSortDirection,
    TableFilterType,
    TableHeaderCell,
} from '@the-deep/deep-ui';

interface ColumnOptions<D, K> {
    cellAsHeader?: boolean,
    sortable?: boolean,
    defaultSortDirection?: TableSortDirection,
    filterType?: TableFilterType,
    orderable?: boolean;
    hideable?: boolean;
    columnWidth?: TableColumn<D, K, TableCellProps<string>, TableHeaderCellProps>['columnWidth'];
}

// FIXME: Move this later to Deep UI and support null and undefined in DateOutput
// eslint-disable-next-line import/prefer-default-export
export function createDateColumn<D, K>(
    id: string,
    title: string,
    accessor: (item: D) => string | number,
    options?: {
        format?: string;
    } & ColumnOptions<D, K>,
) {
    const item: TableColumn<D, K, DateOutputProps, TableHeaderCellProps> & {
        valueSelector: (item: D) => number | string,
        valueComparator: (foo: D, bar: D) => number,
    } = {
        id,
        title,
        cellAsHeader: options?.cellAsHeader,
        headerCellRenderer: TableHeaderCell,
        headerCellRendererParams: {
            sortable: options?.sortable,
            filterType: options?.filterType,
            orderable: options?.orderable,
            hideable: options?.hideable,
        },
        cellRenderer: DateOutput,
        cellRendererParams: (_: K, datum: D): DateOutputProps => ({
            value: accessor(datum),
            format: options?.format,
        }),
        valueSelector: accessor,
        valueComparator: (foo: D, bar: D) => compareDate(accessor(foo), accessor(bar)),
        columnWidth: options?.columnWidth,
    };
    return item;
}
