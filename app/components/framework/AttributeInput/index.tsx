import React, { useCallback } from 'react';
import {
    PartialForm,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    randomString,
} from '@togglecorp/fujs';

import { Widget } from '#types/newAnalyticalFramework';
import { PartialEntryType } from '#views/Project/EntryEdit/schema';

import TextWidgetInput from './TextWidgetInput';
import DateWidgetInput from './DateWidgetInput';
import NumberWidgetInput from './NumberWidgetInput';
import Matrix1dWidgetInput from './Matrix1dWidgetInput';
import Matrix2dWidgetInput from './Matrix2dWidgetInput';
import TimeWidgetInput from './TimeWidgetInput';
import DateRangeWidgetInput from './DateRangeWidgetInput';
import TimeRangeWidgetInput from './TimeRangeWidgetInput';
import ScaleWidgetInput from './ScaleWidgetInput';
import MultiSelectWidgetInput from './MultiSelectWidgetInput';
import SingleSelectWidgetInput from './SingleSelectWidgetInput';
import BaseWidgetInput from './BaseWidgetInput';
import OrganigramWidgetInput from './OrganigramWidgetInput';

type PartialAttributeType = NonNullable<PartialEntryType['attributes']>[number];

export type PartialWidget = PartialForm<
    Widget,
    'clientId' | 'key' | 'widgetId' | 'order'
>;

export interface Props<N extends string | number | undefined> {
    name: N,
    value: PartialAttributeType | null | undefined,
    onChange: (value: SetValueArg<PartialAttributeType>, name: N) => void,

    className?: string,
    widget: PartialWidget,
    readOnly?: boolean;
    disabled?: boolean;
    actions?: React.ReactNode,
}

function AttributeInput<N extends string | number | undefined>(props: Props<N>) {
    const {
        value,
        onChange,
        name,

        className,
        widget,
        readOnly,
        disabled,
        actions,
    } = props;

    const defaultOptionVal = useCallback(
        (): PartialAttributeType => ({
            clientId: randomString(),
            widgetType: widget.widgetId,
            widget: widget.clientId,
            data: undefined,
        }),
        [widget],
    );

    const onFieldChange = useFormObject(name, onChange, defaultOptionVal);

    switch (widget.widgetId) {
        case 'TEXT': {
            if (value && value.widgetType !== widget.widgetId) {
                return null;
            }
            return (
                <TextWidgetInput
                    className={className}
                    title={widget.title}
                    name="data"
                    onChange={onFieldChange}
                    value={value?.data}
                    readOnly={readOnly}
                    disabled={disabled}
                    actions={actions}
                />
            );
        }
        case 'NUMBER': {
            if (value && value.widgetType !== widget.widgetId) {
                return null;
            }
            return (
                <NumberWidgetInput
                    className={className}
                    title={widget.title}
                    name="data"
                    onChange={onFieldChange}
                    value={value?.data}
                    readOnly={readOnly}
                    disabled={disabled}
                    actions={actions}
                />
            );
        }
        case 'DATE': {
            if (value && value.widgetType !== widget.widgetId) {
                return null;
            }
            return (
                <DateWidgetInput
                    className={className}
                    title={widget.title}
                    name="data"
                    onChange={onFieldChange}
                    value={value?.data}
                    readOnly={readOnly}
                    disabled={disabled}
                    actions={actions}
                />
            );
        }
        case 'TIME': {
            if (value && value.widgetType !== widget.widgetId) {
                return null;
            }
            return (
                <TimeWidgetInput
                    className={className}
                    title={widget.title}
                    name="data"
                    onChange={onFieldChange}
                    value={value?.data}
                    readOnly={readOnly}
                    disabled={disabled}
                    actions={actions}
                />
            );
        }
        case 'DATE_RANGE': {
            if (value && value.widgetType !== widget.widgetId) {
                return null;
            }
            return (
                <DateRangeWidgetInput
                    className={className}
                    title={widget.title}
                    name="data"
                    onChange={onFieldChange}
                    value={value?.data}
                    readOnly={readOnly}
                    disabled={disabled}
                    actions={actions}
                />
            );
        }
        case 'TIME_RANGE': {
            if (value && value.widgetType !== widget.widgetId) {
                return null;
            }
            return (
                <TimeRangeWidgetInput
                    className={className}
                    title={widget.title}
                    name="data"
                    onChange={onFieldChange}
                    value={value?.data}
                    readOnly={readOnly}
                    disabled={disabled}
                    actions={actions}
                />
            );
        }
        case 'SCALE': {
            if (value && value.widgetType !== widget.widgetId) {
                return null;
            }
            return (
                <ScaleWidgetInput
                    className={className}
                    title={widget.title}
                    name="data"
                    onChange={onFieldChange}
                    value={value?.data}
                    readOnly={readOnly}
                    disabled={disabled}
                    actions={actions}
                    widget={widget}
                />
            );
        }
        case 'MULTISELECT': {
            if (value && value.widgetType !== widget.widgetId) {
                return null;
            }
            return (
                <MultiSelectWidgetInput
                    className={className}
                    title={widget.title}
                    name="data"
                    onChange={onFieldChange}
                    value={value?.data}
                    readOnly={readOnly}
                    disabled={disabled}
                    actions={actions}
                    widget={widget}
                />
            );
        }
        case 'SELECT': {
            if (value && value.widgetType !== widget.widgetId) {
                return null;
            }
            return (
                <SingleSelectWidgetInput
                    className={className}
                    title={widget.title}
                    name="data"
                    onChange={onFieldChange}
                    value={value?.data}
                    readOnly={readOnly}
                    disabled={disabled}
                    actions={actions}
                    widget={widget}
                />
            );
        }
        case 'MATRIX1D': {
            if (value && value.widgetType !== widget.widgetId) {
                return null;
            }
            return (
                <Matrix1dWidgetInput
                    className={className}
                    title={widget.title}
                    name="data"
                    onChange={onFieldChange}
                    value={value?.data}
                    readOnly={readOnly}
                    disabled={disabled}
                    actions={actions}
                    widget={widget}
                />
            );
        }
        case 'MATRIX2D': {
            if (value && value.widgetType !== widget.widgetId) {
                return null;
            }
            return (
                <Matrix2dWidgetInput
                    className={className}
                    title={widget.title}
                    name="data"
                    onChange={onFieldChange}
                    value={value?.data}
                    readOnly={readOnly}
                    disabled={disabled}
                    actions={actions}
                    widget={widget}
                />
            );
        }
        case 'ORGANIGRAM': {
            if (value && value.widgetType !== widget.widgetId) {
                return null;
            }
            return (
                <OrganigramWidgetInput
                    className={className}
                    title={widget.title}
                    name="data"
                    onChange={onFieldChange}
                    value={value?.data}
                    readOnly={readOnly}
                    disabled={disabled}
                    widget={widget}
                    actions={actions}
                />
            );
        }
        default: {
            return (
                <BaseWidgetInput
                    className={className}
                    title={widget.title}
                    actions={actions}
                />
            );
        }
    }
}

export default AttributeInput;
