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
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';
import {
    IoCaretDownOutline,
    IoGlobeOutline,
} from 'react-icons/io5';
import {
    randomString,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    Widget,
    getWidgetVersion,
    WidgetHint,
} from '#types/newAnalyticalFramework';

import { PartialEntryType } from '#views/Project/EntryEdit/schema';
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
import OrganigramWidgetInput from './OrganigramWidgetInput';
import GeoLocationWidgetInput from './GeoLocationWidgetInput';
import BaseWidgetInput from './BaseWidgetInput';
import {
    filterSelectHints,
    filterScaleHints,
    filterGeoRecommendations,
    filterMultiSelectRecommendations,
    filterOrganigramRecommendations,
    filterMatrix1dRecommendations,
    filterMatrix2dRecommendations,
} from './utils';

import styles from './styles.css';

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

    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;

    onApplyBelowClick?: (widgetId: string) => void;
    onApplyAllClick?: (widgetId: string) => void;

    applyButtonsHidden?: boolean;
    widgetsHints?: WidgetHint[];
    recommendations?: PartialAttributeType[];
    suggestionMode?: boolean;
}

function CompactAttributeInput<N extends string | number | undefined>(props: Props<N>) {
    const {
        value,
        onChange,
        name,

        className,
        widget,
        readOnly,
        disabled,
        error: riskyError,

        geoAreaOptions,
        onGeoAreaOptionsChange,

        onApplyBelowClick,
        onApplyAllClick,

        applyButtonsHidden = true,
        widgetsHints,
        recommendations,

        suggestionMode,
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
    const handleApplyBelowClick = useCallback(() => {
        if (onApplyBelowClick) {
            onApplyBelowClick(widget.clientId);
        }
    }, [onApplyBelowClick, widget.clientId]);

    const handleApplyAllClick = useCallback(() => {
        if (onApplyAllClick) {
            onApplyAllClick(widget.clientId);
        }
    }, [onApplyAllClick, widget.clientId]);

    // TODO: check widget and attribute version

    // FIXME: hide this if apply not implemented
    const actions = !readOnly && !applyButtonsHidden && (
        <>
            <QuickActionConfirmButton
                className={styles.button}
                name={widget.clientId}
                onConfirm={handleApplyBelowClick}
                message="Are you sure you want to apply this widget's value to all the entries below?"
                title="Apply to all below"
                disabled={disabled}
                spacing="compact"
            >
                <IoCaretDownOutline />
            </QuickActionConfirmButton>
            <QuickActionConfirmButton
                className={styles.button}
                name={widget.clientId}
                onConfirm={handleApplyAllClick}
                message="Are you sure you want to apply this widget's value to all entries in this source?"
                title="Apply to all"
                disabled={disabled}
                spacing="compact"
            >
                <IoGlobeOutline />
            </QuickActionConfirmButton>
        </>
    );

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
                error={error?.data as Error<typeof data> | undefined}
                actions={actions}
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
                error={error?.data as Error<typeof data> | undefined}
                actions={actions}
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
                error={error?.data as Error<typeof data> | undefined}
                actions={actions}
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
                error={error?.data as Error<typeof data> | undefined}
                actions={actions}
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
                error={error?.data as Error<typeof data> | undefined}
                actions={actions}
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
                error={error?.data as Error<typeof data> | undefined}
                actions={actions}
            />
        );
    } else if (widget.widgetId === 'SCALE' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        const widgetHints = widgetsHints
            ?.filter(filterScaleHints)
            ?.find((hint) => hint.widgetPk === widget.id);

        component = (
            <ScaleWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                widget={widget}
                error={error?.data as Error<typeof data> | undefined}
                actions={actions}
                widgetHints={widgetHints?.hints}
            />
        );
    } else if (widget.widgetId === 'MULTISELECT' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;

        const widgetRecommendation = recommendations
            ?.filter(filterMultiSelectRecommendations)
            ?.find((recommendation) => recommendation.widget === widget.id);

        component = (
            <MultiSelectWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                widget={widget}
                error={error?.data as Error<typeof data> | undefined}
                actions={actions}
                recommendedValue={widgetRecommendation?.data}
                suggestionMode={suggestionMode}
            />
        );
    } else if (widget.widgetId === 'SELECT' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;
        const widgetHints = widgetsHints
            ?.filter(filterSelectHints)
            ?.find((hint) => hint.widgetPk === widget.id);

        component = (
            <SingleSelectWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                widget={widget}
                error={error?.data as Error<typeof data> | undefined}
                actions={actions}
                widgetHints={widgetHints?.hints}
                suggestionMode={suggestionMode}
            />
        );
    } else if (widget.widgetId === 'MATRIX1D' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;

        // FIXME: Handle this in an efficient manner
        const widgetRecommendedValue = recommendations
            ?.filter(filterMatrix1dRecommendations)
            ?.find((recommendation) => recommendation.widget === widget.id)
            ?.data;

        component = (
            <Matrix1dWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                widget={widget}
                error={error?.data as Error<typeof data> | undefined}
                actions={actions}
                suggestionMode={suggestionMode}
                recommendedValue={widgetRecommendedValue}
            />
        );
    } else if (widget.widgetId === 'MATRIX2D' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;

        // FIXME: Handle this in an efficient manner
        const widgetRecommendedValue = recommendations
            ?.filter(filterMatrix2dRecommendations)
            ?.find((recommendation) => recommendation.widget === widget.id)
            ?.data;

        component = (
            <Matrix2dWidgetInput
                className={className}
                title={widget.title}
                name="data"
                onChange={onFieldChange}
                value={data}
                readOnly={readOnly}
                disabled={disabled}
                widget={widget}
                error={error?.data as Error<typeof data> | undefined}
                actions={actions}
                suggestionMode={suggestionMode}
                recommendedValue={widgetRecommendedValue}
            />
        );
    } else if (widget.widgetId === 'ORGANIGRAM' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;

        const widgetRecommendation = recommendations
            ?.filter(filterOrganigramRecommendations)
            ?.find((recommendation) => recommendation.widget === widget.id);

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
                error={error?.data as Error<typeof data> | undefined}
                actions={actions}
                recommendedValue={widgetRecommendation?.data}
                suggestionMode={suggestionMode}
            />
        );
    } else if (widget.widgetId === 'GEO' && (isNotDefined(value) || value.widgetType === widget.widgetId)) {
        const data = value?.data;

        // FIXME: Handle this in an efficient manner
        const widgetRecommendedValue = recommendations
            ?.filter(filterGeoRecommendations)
            ?.find((recommendation) => recommendation.widget === widget.id)
            ?.data;

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
                error={error?.data as Error<typeof data> | undefined}
                geoAreaOptions={geoAreaOptions}
                onGeoAreaOptionsChange={onGeoAreaOptionsChange}
                actions={actions}
                suggestionMode={suggestionMode}
                recommendedValue={widgetRecommendedValue}
            />
        );
    } else {
        component = (
            <BaseWidgetInput
                className={className}
                title={widget.title}
                error={error?.data}
                disabled={disabled}
                readOnly={readOnly}
                actions={actions}
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

export default CompactAttributeInput;
