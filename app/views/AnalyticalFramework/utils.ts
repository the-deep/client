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
    BaseWidget,
} from '#types/newAnalyticalFramework';

function cloneWidgetSuperficially<T extends BaseWidget>(value: T): T {
    const randKey = randomString();
    return {
        ...value,
        key: randKey,
        clientId: randKey,
        id: undefined,
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

    // NOTE: rememebering index to get defaultOption after transformation
    const defaultOptionIndex = options.findIndex((o) => (
        o.clientId === widget.properties.defaultValue
    ));

    const clonedOptions = options.map(cloneOption);

    return cloneWidgetSuperficially({
        ...widget,
        properties: {
            ...widget.properties,
            options: clonedOptions,
            defaultValue: defaultOptionIndex !== -1
                ? clonedOptions[defaultOptionIndex]?.clientId
                : undefined,
        },
    });
}

function cloneMultiSelectionWidget(widget: MultiSelectWidget) {
    return cloneWidgetSuperficially({
        ...widget,
        properties: {
            ...widget.properties,
            options: widget.properties.options.map(cloneOption),
        },
    });
}

function cloneSingleSelectionWidget(widget: SingleSelectWidget) {
    return cloneWidgetSuperficially({
        ...widget,
        properties: {
            ...widget.properties,
            options: widget.properties.options.map(cloneOption),
        },
    });
}

function transformOrganigramData(data: OrganigramDatum): OrganigramDatum {
    return cloneOption({
        ...data,
        children: data.children?.map(transformOrganigramData),
    });
}

function cloneOrganigramWidget(widget: OrganigramWidget) {
    return cloneWidgetSuperficially({
        ...widget,
        properties: {
            ...widget.properties,
            options: transformOrganigramData(widget.properties.options),
        },
    });
}

function cloneMatrix1dWidget(widget: Matrix1dWidget) {
    return cloneWidgetSuperficially({
        ...widget,
        properties: {
            ...widget.properties,
            rows: widget.properties.rows.map((row) => (
                cloneOption({
                    ...row,
                    cells: row.cells.map(cloneOption),
                })
            )),
        },
    });
}

function cloneMatrix2dWidget(widget: Matrix2dWidget) {
    return cloneWidgetSuperficially({
        ...widget,
        properties: {
            ...widget.properties,
            rows: widget.properties.rows.map((row) => (
                cloneOption({
                    ...row,
                    subRows: row.subRows.map(cloneOption),
                })
            )),
            columns: widget.properties.columns.map((column) => (
                cloneOption({
                    ...column,
                    subColumns: column.subColumns.map(cloneOption),
                })
            )),
        },
    });
}
// eslint-disable-next-line import/prefer-default-export
export function cloneWidget(
    widget: Widget,
): Widget | undefined {
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
            return cloneSingleSelectionWidget(widget);
        case 'MULTISELECT':
            return cloneMultiSelectionWidget(widget);
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
