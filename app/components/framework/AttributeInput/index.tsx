import React, { useCallback } from 'react';
import {
    PartialForm,
    SetValueArg,
    useFormObject,
    Error,
    ArrayError,
    ObjectError,
    internal,
} from '@togglecorp/toggle-form';
import {
    randomString,
    isNotDefined,
} from '@togglecorp/fujs';

import { Widget, getWidgetVersion } from '#types/newAnalyticalFramework';
import { PartialEntryType } from '#components/entry/schema';
import NonFieldError from '#components/NonFieldError';
import { GeoArea } from '#components/GeoMultiSelectInput';

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
import GeoLocationWidgetInput from './GeoLocationWidgetInput';

// FIXME: move this to utils later on
export function getErrorObject<T extends ArrayError<T>>(
    value: T | string | undefined,
): T | undefined
export function getErrorObject<T extends ObjectError<T>>(
    value: ArrayError<T> | string | undefined,
): T | undefined
export function getErrorObject<T extends ArrayError<T> | ObjectError<T>>(
    value: T | string | undefined,
) {
    if (isNotDefined(value)) {
        return undefined;
    }
    if (typeof value === 'string') {
        return {
            [internal]: value,
        };
    }
    return value;
}

type PartialAttributeType = NonNullable<PartialEntryType['attributes']>[number];

export type PartialWidget = PartialForm<
    Widget,
    'key' | 'widgetId' | 'clientId' | 'order' | 'conditional'
>;

export interface Props<N extends string | number | undefined> {
    name: N,
    value: PartialAttributeType | null | undefined,
    error: Error<PartialAttributeType> | undefined,
    onChange: (value: SetValueArg<PartialAttributeType>, name: N) => void,

    className?: string,
    widget: PartialWidget,
    readOnly?: boolean;
    disabled?: boolean;
    actions?: React.ReactNode;
    icons?: React.ReactNode;
    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;

    rightComponent?: React.ReactNode;
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
        icons,
        error: riskyError,

        geoAreaOptions,
        onGeoAreaOptionsChange,

        rightComponent,
    } = props;

    const error = getErrorObject(riskyError);

    const defaultOptionVal = useCallback(
        (): PartialAttributeType => ({
            clientId: `auto-${randomString()}`,
            widgetType: widget.widgetId,
            // NOTE: widget.id should always be defined before an attribute can be saved
            widget: widget.id ?? 'not-random',
            data: undefined,
            widgetVersion: getWidgetVersion(widget.widgetId),
        }),
        [widget],
    );

    const onFieldChange = useFormObject(name, onChange, defaultOptionVal);

    let component: JSX.Element;

    // TODO: check widget and attribute version

    if (widget.widgetId === 'TEXT' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        component = (
            <TextWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
                icons={icons}
                error={error?.data as Error<typeof data> | undefined}
            />
        );
    } else if (widget.widgetId === 'NUMBER' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        component = (
            <NumberWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
                icons={icons}
                error={error?.data as Error<typeof data> | undefined}
            />
        );
    } else if (widget.widgetId === 'DATE' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        component = (
            <DateWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
                icons={icons}
                error={error?.data as Error<typeof data> | undefined}
            />
        );
    } else if (widget.widgetId === 'TIME' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        component = (
            <TimeWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
                icons={icons}
                error={error?.data as Error<typeof data> | undefined}
            />
        );
    } else if (widget.widgetId === 'DATE_RANGE' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        component = (
            <DateRangeWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
                icons={icons}
                error={error?.data as Error<typeof data> | undefined}
            />
        );
    } else if (widget.widgetId === 'TIME_RANGE' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        component = (
            <TimeRangeWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
                icons={icons}
                error={error?.data as Error<typeof data> | undefined}
            />
        );
    } else if (widget.widgetId === 'SCALE' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        component = (
            <ScaleWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
                icons={icons}
                widget={widget}
                error={error?.data as Error<typeof data> | undefined}
            />
        );
    } else if (widget.widgetId === 'MULTISELECT' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        component = (
            <MultiSelectWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
                icons={icons}
                widget={widget}
                error={error?.data as Error<typeof data> | undefined}
            />
        );
    } else if (widget.widgetId === 'SELECT' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        component = (
            <SingleSelectWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
                icons={icons}
                widget={widget}
                error={error?.data as Error<typeof data> | undefined}
            />
        );
    } else if (widget.widgetId === 'MATRIX1D' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        component = (
            <Matrix1dWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
                icons={icons}
                widget={widget}
                error={error?.data as Error<typeof data> | undefined}
            />
        );
    } else if (widget.widgetId === 'MATRIX2D' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        component = (
            <Matrix2dWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                actions={actions}
                icons={icons}
                widget={widget}
                error={error?.data as Error<typeof data> | undefined}
            />
        );
    } else if (widget.widgetId === 'ORGANIGRAM' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        component = (
            <OrganigramWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                widget={widget}
                actions={actions}
                icons={icons}
                error={error?.data as Error<typeof data> | undefined}
            />
        );
    } else if (widget.widgetId === 'GEO' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        component = (
            <GeoLocationWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                widget={widget}
                actions={actions}
                icons={icons}
                error={error?.data as Error<typeof data> | undefined}
                geoAreaOptions={geoAreaOptions}
                onGeoAreaOptionsChange={onGeoAreaOptionsChange}
                rightComponent={rightComponent}
            />
        );
    } else {
        component = (
            <BaseWidgetInput
                className={className}
                title={widget.title}
                actions={actions}
                icons={icons}
                error={error?.data}
                disabled={disabled}
                readOnly={readOnly}
            />
        );
    }

    return (
        <>
            <NonFieldError error={error} />
            {component}
        </>
    );
}

export default AttributeInput;
