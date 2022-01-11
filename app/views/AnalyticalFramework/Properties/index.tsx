import React, { useMemo, useCallback } from 'react';
import {
    SelectInput,
    Container,
    MultiSelectInput,
} from '@the-deep/deep-ui';
import { isDefined, _cs } from '@togglecorp/fujs';
import {
    getErrorObject,
    getErrorString,
    useFormObject,
    SetValueArg,
    Error,
} from '@togglecorp/toggle-form';

import {
    FrameworkProperties,
} from '#types/newAnalyticalFramework';

import NonFieldError from '#components/NonFieldError';

import { WidgetsType, PropertiesType } from '../schema';
import styles from './styles.css';

const widgetIdSelector = (w: { id: number }) => w.id;

const widgetLabelSelector = (w: { id: number; title: string }) => w.title;

interface PropertiesProps<K extends string> {
    className?: string;
    allWidgets: WidgetsType | undefined;
    name: K;
    value: PropertiesType | undefined;
    error: Error<PropertiesType> | undefined;
    onChange: (value: SetValueArg<PropertiesType | undefined>, name: K) => void;
    disabled?: boolean;
}

function Properties<K extends string>(props: PropertiesProps<K>) {
    const {
        className,
        allWidgets,
        name,
        onChange,
        value,
        error: riskyError,
        disabled,
    } = props;

    const {
        matrix1dWidgets,
        matrix2dWidgets,
        scaleWidgets,
        geoWidgets,
        organigramWidgets,
        multiSelectWidgets,
    } = useMemo(() => {
        const createdWidgets = allWidgets
            ?.filter((w) => isDefined(w.id))
            .map((w) => ({
                id: +w.id,
                title: w.title,
                widgetId: w.widgetId,
            }));

        return ({
            matrix1dWidgets: createdWidgets?.filter((w) => w.widgetId === 'MATRIX1D'),
            matrix2dWidgets: createdWidgets?.filter((w) => w.widgetId === 'MATRIX2D'),
            scaleWidgets: createdWidgets?.filter((w) => w.widgetId === 'SCALE'),
            geoWidgets: createdWidgets?.filter((w) => w.widgetId === 'GEO'),
            organigramWidgets: createdWidgets?.filter((w) => w.widgetId === 'ORGANIGRAM'),
            multiSelectWidgets: createdWidgets?.filter((w) => w.widgetId === 'MULTISELECT'),
        });
    }, [allWidgets]);

    const onFieldChange = useFormObject(name, onChange, {} as FrameworkProperties);
    const onStatsConfigChange = useFormObject('stats_config', onFieldChange, {} as FrameworkProperties['stats_config']);

    const error = getErrorObject(riskyError);
    const statsConfigError = getErrorObject(error?.stats_config);

    const onAffectedGroupsChange = useCallback((newVal: number | undefined) => {
        onStatsConfigChange(newVal ? { pk: newVal } : undefined, 'affected_groups_widget');
    }, [onStatsConfigChange]);

    const onGeoWidgetChange = useCallback((newVal: number | undefined) => {
        onStatsConfigChange(newVal ? { pk: newVal } : undefined, 'geo_widget');
    }, [onStatsConfigChange]);

    const onSeverityWidgetChange = useCallback((newVal: number | undefined) => {
        onStatsConfigChange(newVal ? { pk: newVal } : undefined, 'severity_widget');
    }, [onStatsConfigChange]);

    const onReliabilityWidgetChange = useCallback((newVal: number | undefined) => {
        onStatsConfigChange(newVal ? { pk: newVal } : undefined, 'reliability_widget');
    }, [onStatsConfigChange]);

    const onSpecificNeedsWidgetChange = useCallback((newVal: number | undefined) => {
        onStatsConfigChange(newVal ? { pk: newVal } : undefined, 'specific_needs_groups_widgets');
    }, [onStatsConfigChange]);

    const onMatrix1dValueChange = useCallback((newVal: number[] | undefined) => {
        if (!newVal) {
            onStatsConfigChange(undefined, 'matrix1d');
        } else {
            const transformedNewVal = newVal.map((d) => ({ pk: d }));
            onStatsConfigChange(transformedNewVal, 'matrix1d');
        }
    }, [onStatsConfigChange]);

    const onMatrix2dValueChange = useCallback((newVal: number[] | undefined) => {
        if (!newVal) {
            onStatsConfigChange(undefined, 'matrix2d');
        } else {
            const transformedNewVal = newVal.map((d) => ({ pk: d }));
            onStatsConfigChange(transformedNewVal, 'matrix2d');
        }
    }, [onStatsConfigChange]);

    const matrix1dValue = useMemo(() => (
        value?.stats_config?.matrix1d?.map((d) => d.pk).filter(isDefined)
    ), [value?.stats_config]);

    const matrix2dValue = useMemo(() => (
        value?.stats_config?.matrix2d?.map((d) => d.pk).filter(isDefined)
    ), [value?.stats_config]);

    return (
        <Container
            heading="Visualization Settings"
            headingSize="small"
            headingDescription="NOTE: You will only be able to see widgets that are already created and saved."
            className={_cs(className, styles.vizSettingsContainer)}
            contentClassName={styles.vizSettings}
        >
            <NonFieldError error={error} />
            <MultiSelectInput
                label="Matrix 1D"
                options={matrix1dWidgets}
                name="matrix1d"
                value={matrix1dValue}
                error={getErrorString(statsConfigError?.matrix1d)}
                onChange={onMatrix1dValueChange}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
            <MultiSelectInput
                label="Matrix 2D"
                options={matrix2dWidgets}
                name="matrix2d"
                value={matrix2dValue}
                error={getErrorString(statsConfigError?.matrix2d)}
                onChange={onMatrix2dValueChange}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
            <SelectInput
                label="Geo Widget"
                options={geoWidgets}
                name="geo_widget"
                value={value?.stats_config?.geo_widget?.pk}
                error={getErrorString(statsConfigError?.geo_widget)}
                onChange={onGeoWidgetChange}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
            <SelectInput
                label="Severity Widget"
                options={scaleWidgets}
                name="severity_widget"
                value={value?.stats_config?.severity_widget?.pk}
                error={getErrorString(statsConfigError?.severity_widget)}
                onChange={onSeverityWidgetChange}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
            <SelectInput
                label="Reliability Widget"
                options={scaleWidgets}
                name="reliability_widget"
                value={value?.stats_config?.reliability_widget?.pk}
                error={getErrorString(statsConfigError?.reliability_widget)}
                onChange={onReliabilityWidgetChange}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
            <SelectInput
                label="Affected Groups"
                options={organigramWidgets}
                name="affected_groups_widget"
                value={value?.stats_config?.affected_groups_widget?.pk}
                error={getErrorString(statsConfigError?.affected_groups_widget)}
                onChange={onAffectedGroupsChange}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
            <SelectInput
                label="Specific Needs Groups"
                options={multiSelectWidgets}
                name="specific_needs_groups_widgets"
                value={value?.stats_config?.specific_needs_groups_widgets?.pk}
                error={getErrorString(statsConfigError?.specific_needs_groups_widgets)}
                onChange={onSpecificNeedsWidgetChange}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
        </Container>
    );
}

export default Properties;
