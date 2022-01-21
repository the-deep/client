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
        conditional: undefined,
    };
}

function cloneOption<T extends KeyLabelEntity>(value: T): T {
    return {
        ...value,
        clientId: randomString(),
    };
}

function cloneScaleWidget(widget: ScaleWidget): ScaleWidget {
    if (!widget.properties) {
        return cloneWidgetSuperficially(widget);
    }
    // NOTE: remembering index to get defaultOption after transformation
    const defaultOptionIndex = widget.properties.options.findIndex((o) => (
        o.key === widget.properties?.defaultValue
    ));

    const clonedOptions = widget.properties.options.map(cloneOption);

    return cloneWidgetSuperficially({
        ...widget,
        properties: {
            ...widget.properties,
            options: clonedOptions,
            defaultValue: defaultOptionIndex !== -1
                ? clonedOptions[defaultOptionIndex]?.key
                : undefined,
        },
    });
}

function cloneMultiSelectionWidget(widget: MultiSelectWidget): MultiSelectWidget {
    return cloneWidgetSuperficially({
        ...widget,
        properties: widget.properties ? {
            ...widget.properties,
            options: widget.properties.options.map(cloneOption),
        } : undefined,
    });
}

function cloneSingleSelectionWidget(widget: SingleSelectWidget): SingleSelectWidget {
    return cloneWidgetSuperficially({
        ...widget,
        properties: widget.properties ? {
            ...widget.properties,
            options: widget.properties.options.map(cloneOption),
        } : undefined,
    });
}

function transformOrganigramData(data: OrganigramDatum): OrganigramDatum {
    return cloneOption({
        ...data,
        children: data.children?.map(transformOrganigramData),
    });
}

function cloneOrganigramWidget(widget: OrganigramWidget): OrganigramWidget {
    return cloneWidgetSuperficially({
        ...widget,
        properties: widget.properties ? {
            ...widget.properties,
            options: transformOrganigramData(widget.properties.options),
        } : undefined,
    });
}

function cloneMatrix1dWidget(widget: Matrix1dWidget): Matrix1dWidget {
    return cloneWidgetSuperficially({
        ...widget,
        properties: widget.properties ? {
            ...widget.properties,
            rows: widget.properties.rows.map((row) => (
                cloneOption({
                    ...row,
                    cells: row.cells.map(cloneOption),
                })
            )),
        } : undefined,
    });
}

function cloneMatrix2dWidget(widget: Matrix2dWidget): Matrix2dWidget {
    return cloneWidgetSuperficially({
        ...widget,
        properties: widget.properties ? {
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
        } : undefined,
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
            // FIXME: add "not implemented" console
            return undefined;
    }
}
