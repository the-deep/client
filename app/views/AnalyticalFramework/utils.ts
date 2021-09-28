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
} from '#types/newAnalyticalFramework';
import { PartialWidget } from '#components/framework/AttributeInput';

function clone(widget: PartialWidget) {
    return ({
        ...widget,
        title: `${widget.title}-cloned`,
        key: randomString(),
        clientId: randomString(),
        id: undefined,
    });
}

function cloneScaleWidget(widget: ScaleWidget) {
    const { options } = widget.properties;
    const defaultOption = options.find((v) => v.clientId === widget.properties.defaultValue);
    const otherOptions = options.filter((v) => v.clientId !== defaultOption?.clientId)
        .map((v) => ({
            ...v,
            clientId: randomString(),
        }));

    if (defaultOption) {
        const newDefaultOption = { ...defaultOption, clientId: randomString() };
        return ({
            ...widget,
            id: undefined,
            key: randomString(),
            clientId: randomString(),
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
        ...widget,
        id: undefined,
        key: randomString(),
        clientId: randomString(),
        properties: {
            options: [
                ...otherOptions,
            ],
        },
    });
}

function cloneSelectionWidget(widget: MultiSelectWidget | SingleSelectWidget) {
    return ({
        ...widget,
        id: undefined,
        key: randomString(),
        clientId: randomString(),
        properties: {
            options: widget.properties.options.map((v) => ({
                ...v,
                clientId: randomString(),
            })),
        },
    });
}

function transformOrganigramData(data: OrganigramDatum): OrganigramDatum {
    if (data.children) {
        return {
            ...data,
            clientId: randomString(),
            children: data.children.map(transformOrganigramData),
        };
    }
    return {
        ...data,
        children: [],
    };
}

function cloneOrganigramWidget(widget: OrganigramWidget) {
    return ({
        ...widget,
        id: undefined,
        key: randomString(),
        clientId: randomString(),
        properties: {
            options: transformOrganigramData(widget.properties.options),
        },
    });
}

function cloneMatrix1dWidget(widget: Matrix1dWidget) {
    return ({
        ...widget,
        id: undefined,
        key: randomString(),
        clientId: randomString(),
        properties: {
            rows: widget.properties.rows.map((row) => ({
                ...row,
                clientId: randomString(),
                cells: row.cells.map((cell) => ({
                    ...cell,
                    clientId: randomString(),
                })),
            })),
        },
    });
}

function cloneMatrix2dWidget(widget: Matrix2dWidget) {
    return {
        ...widget,
        id: undefined,
        key: randomString(),
        clientId: randomString(),
        properties: {
            rows: widget.properties.rows.map((row) => ({
                ...row,
                clientId: randomString(),
                subRows: row.subRows.map((subRow) => ({
                    ...subRow,
                    clientId: randomString(),
                })),
            })),
            columns: widget.properties.columns.map((column) => ({
                ...column,
                clientId: randomString(),
                subColumns: column.subColumns.map((subColumn) => ({
                    ...subColumn,
                    clientId: randomString(),
                })),
            })),
        },
    };
}
// eslint-disable-next-line import/prefer-default-export
export function cloneWidget(
    widget: Widget,
) {
    switch (widget.widgetId) {
        case 'DATE':
            return clone(widget);
        case 'DATE_RANGE':
            return clone(widget);
        case 'TIME':
            return clone(widget);
        case 'TIME_RANGE':
            return clone(widget);
        case 'NUMBER':
            return clone(widget);
        case 'SCALE':
            return cloneScaleWidget(widget);
        case 'GEO':
            return clone(widget);
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
            return clone(widget);
        default:
            return undefined;
    }
}
