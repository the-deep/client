import { randomString } from '@togglecorp/fujs';
import {
    Widget,
    ScaleWidget,
    SingleSelectWidget,
    MultiSelectWidget,
    OrganigramWidget,
    OrganigramDatum,
    Matrix1dWidget,
    Matrix2dWidget,
    KeyLabelEntity,
    KeyLabelColorEntity,
    BaseWidget,
    Matrix1dRows,
    Matrix2dRows,
    Matrix2dColumns,
} from '#types/newAnalyticalFramework';

function cloneWidgetSuperficially<T extends BaseWidget>(value: T): T {
    const randKey = randomString();
    return {
        ...value,
        key: randKey,
        clientId: randKey,
        id: undefined,
        title: `${value.title}: Cloned`,
    };
}

function cloneOption<T extends KeyLabelEntity>(value: T): T {
    return {
        ...value,
        clientId: randomString(),
    };
}

function cloneScaleWidget(widget: ScaleWidget) {
    const { options } = widget.properties;
    const defaultOption = options.find((o: KeyLabelColorEntity) => (
        o.clientId === widget.properties.defaultValue
    ));
    const otherOptions = options.filter((o: KeyLabelColorEntity) => (
        o.clientId !== defaultOption?.clientId
    ))
        .map((o: KeyLabelColorEntity) => cloneOption(o));

    const partiallyClonedWidget = cloneWidgetSuperficially(widget);

    if (defaultOption) {
        const newDefaultOption = cloneOption(defaultOption);
        return ({
            ...partiallyClonedWidget,
            properties: {
                options: [
                    ...otherOptions,
                    newDefaultOption,
                ],
                defaultValue: newDefaultOption.clientId,
            },
        });
    }

    return ({
        ...partiallyClonedWidget,
        properties: {
            options: [
                ...otherOptions,
            ],
        },
    });
}

function cloneSelectionWidget(widget: MultiSelectWidget | SingleSelectWidget) {
    const partiallyClonedWidget = cloneWidgetSuperficially(widget);
    return ({
        ...partiallyClonedWidget,
        properties: {
            options: widget.properties.options.map((v: KeyLabelEntity) => cloneOption(v)),
        },
    });
}

function transformOrganigramData(data: OrganigramDatum): OrganigramDatum {
    const clonedOption = cloneOption(data);
    if (data.children) {
        return {
            ...clonedOption,
            children: data.children.map(transformOrganigramData),
        };
    }
    return {
        ...clonedOption,
        children: [],
    };
}

function cloneOrganigramWidget(widget: OrganigramWidget) {
    const partiallyClonedWidget = cloneWidgetSuperficially(widget);
    return ({
        ...partiallyClonedWidget,
        properties: {
            options: transformOrganigramData(widget.properties.options),
        },
    });
}

function cloneMatrix1dWidget(widget: Matrix1dWidget) {
    const partiallyClonedWidget = cloneWidgetSuperficially(widget);
    return ({
        ...partiallyClonedWidget,
        properties: {
            rows: widget.properties.rows.map((row: Matrix1dRows) => {
                const clonedRow = cloneOption(row);
                return ({
                    ...clonedRow,
                    cells: row.cells.map((cell: KeyLabelEntity) => cloneOption(cell)),
                });
            }),
        },
    });
}

function cloneMatrix2dWidget(widget: Matrix2dWidget) {
    const partiallyClonedWidget = cloneWidgetSuperficially(widget);
    return {
        ...partiallyClonedWidget,
        properties: {
            rows: widget.properties.rows.map((row: Matrix2dRows) => {
                const clonedRow = cloneOption(row);
                return ({
                    ...clonedRow,
                    clientId: randomString(),
                    subRows: row.subRows.map((subRow: KeyLabelEntity) => (cloneOption(subRow))),
                });
            }),
            columns: widget.properties.columns.map((column: Matrix2dColumns) => {
                const clonedColumn = cloneOption(column);
                return ({
                    ...clonedColumn,
                    subColumns: column.subColumns.map(
                        (subColumn: KeyLabelEntity) => (cloneOption(subColumn)),
                    ),
                });
            }),
        },
    };
}
// eslint-disable-next-line import/prefer-default-export
export function cloneWidget(
    widget: Widget,
) {
    switch (widget.widgetId) {
        case 'DATE':
            return cloneWidgetSuperficially(widget);
        case 'DATE_RANGE':
            return cloneWidgetSuperficially(widget);
        case 'TIME':
            return cloneWidgetSuperficially(widget);
        case 'TIME_RANGE':
            return cloneWidgetSuperficially(widget);
        case 'NUMBER':
            return cloneWidgetSuperficially(widget);
        case 'SCALE':
            return cloneScaleWidget(widget);
        case 'GEO':
            return cloneWidgetSuperficially(widget);
        case 'SELECT':
            return cloneSelectionWidget(widget);
        case 'MULTISELECT':
            return cloneSelectionWidget(widget);
        case 'ORGANIGRAM':
            return cloneOrganigramWidget(widget);
        case 'MATRIX1D':
            return cloneMatrix1dWidget(widget);
        case 'MATRIX2D':
            return cloneMatrix2dWidget(widget);
        case 'TEXT':
            return cloneWidgetSuperficially(widget);
        default:
            return undefined;
    }
}
