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

import NonFieldError from '#components/NonFieldError';

import { WidgetsType, PropertiesType } from '../schema';
import styles from './styles.css';

const widgetIdSelector = (w: { id: string }) => w.id;

const widgetLabelSelector = (w: { id: string; title: string }) => w.title;

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
                id: w.id,
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

    const onFieldChange = useFormObject(name, onChange, {});
    const onStatsConfigChange = useFormObject('statsConfig', onFieldChange, {});

    const error = getErrorObject(riskyError);
    const statsConfigError = getErrorObject(error?.statsConfig);

    const onGeoWidgetChange = useCallback((newVal: string | undefined) => {
        onStatsConfigChange(newVal ? { pk: newVal } : undefined, 'geoWidget');
    }, [onStatsConfigChange]);

    const onSeverityWidgetChange = useCallback((newVal: string | undefined) => {
        onStatsConfigChange(newVal ? { pk: newVal } : undefined, 'severityWidget');
    }, [onStatsConfigChange]);

    const onReliabilityWidgetChange = useCallback((newVal: string | undefined) => {
        onStatsConfigChange(newVal ? { pk: newVal } : undefined, 'reliabilityWidget');
    }, [onStatsConfigChange]);

    const onMultiselectWidgets = useCallback((newVal: string[] | undefined) => {
        if (!newVal) {
            onStatsConfigChange(undefined, 'multiselectWidgets');
        } else {
            const transformedNewVal = newVal.map((d) => ({ pk: d }));
            onStatsConfigChange(transformedNewVal, 'multiselectWidgets');
        }
    }, [onStatsConfigChange]);

    const onOrganigramWidgets = useCallback((newVal: string[] | undefined) => {
        if (!newVal) {
            onStatsConfigChange(undefined, 'organigramWidgets');
        } else {
            const transformedNewVal = newVal.map((d) => ({ pk: d }));
            onStatsConfigChange(transformedNewVal, 'organigramWidgets');
        }
    }, [onStatsConfigChange]);

    const onMatrix1dValueChange = useCallback((newVal: string[] | undefined) => {
        if (!newVal) {
            onStatsConfigChange(undefined, 'widget1d');
        } else {
            const transformedNewVal = newVal.map((d) => ({ pk: d }));
            onStatsConfigChange(transformedNewVal, 'widget1d');
        }
    }, [onStatsConfigChange]);

    const onMatrix2dValueChange = useCallback((newVal: string[] | undefined) => {
        if (!newVal) {
            onStatsConfigChange(undefined, 'widget2d');
        } else {
            const transformedNewVal = newVal.map((d) => ({ pk: d }));
            onStatsConfigChange(transformedNewVal, 'widget2d');
        }
    }, [onStatsConfigChange]);

    const matrix1dValue = useMemo(() => (
        value?.statsConfig?.widget1d?.map((d) => d.pk).filter(isDefined)
    ), [value?.statsConfig]);

    const matrix2dValue = useMemo(() => (
        value?.statsConfig?.widget2d?.map((d) => d.pk).filter(isDefined)
    ), [value?.statsConfig]);

    const organigramValue = useMemo(() => (
        value?.statsConfig?.organigramWidgets?.map((d) => d.pk).filter(isDefined)
    ), [value?.statsConfig]);

    const multiselectValue = useMemo(() => (
        value?.statsConfig?.multiselectWidgets?.map((d) => d.pk).filter(isDefined)
    ), [value?.statsConfig]);

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
                name={undefined}
                value={matrix1dValue}
                error={getErrorString(statsConfigError?.widget1d)}
                onChange={onMatrix1dValueChange}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
            <MultiSelectInput
                label="Matrix 2D"
                options={matrix2dWidgets}
                name={undefined}
                value={matrix2dValue}
                error={getErrorString(statsConfigError?.widget2d)}
                onChange={onMatrix2dValueChange}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
            <SelectInput
                label="Geo Widget"
                options={geoWidgets}
                name="geoWidget"
                value={value?.statsConfig?.geoWidget?.pk}
                error={getErrorString(statsConfigError?.geoWidget)}
                onChange={onGeoWidgetChange}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
            <SelectInput
                label="Severity Widget"
                options={scaleWidgets}
                name="severityWidget"
                value={value?.statsConfig?.severityWidget?.pk}
                error={getErrorString(statsConfigError?.severityWidget)}
                onChange={onSeverityWidgetChange}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
            <SelectInput
                label="Reliability Widget"
                options={scaleWidgets}
                name="reliabilityWidget"
                value={value?.statsConfig?.reliabilityWidget?.pk}
                error={getErrorString(statsConfigError?.reliabilityWidget)}
                onChange={onReliabilityWidgetChange}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
            <MultiSelectInput
                label="Organigram Widgets"
                options={organigramWidgets}
                name={undefined}
                value={organigramValue}
                error={getErrorString(statsConfigError?.organigramWidgets)}
                onChange={onOrganigramWidgets}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
            <MultiSelectInput
                label="Multiselect Widgets"
                options={multiSelectWidgets}
                name={undefined}
                value={multiselectValue}
                error={getErrorString(statsConfigError?.multiselectWidgets)}
                onChange={onMultiselectWidgets}
                keySelector={widgetIdSelector}
                labelSelector={widgetLabelSelector}
                disabled={disabled}
            />
        </Container>
    );
}

export default Properties;
