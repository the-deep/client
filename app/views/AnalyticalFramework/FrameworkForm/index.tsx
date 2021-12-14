import React, { useMemo, useState, useCallback } from 'react';
import {
    Tab,
    TextArea,
    SelectInput,
    Container,
    useAlert,
    TextInput,
    DateInput,
    MultiSelectInput,
    TabPanel,
    Checkbox,
    PendingMessage,
    Button,
} from '@the-deep/deep-ui';
import {
    generatePath,
    useHistory,
    useLocation,
    Prompt,
} from 'react-router-dom';
import { isDefined, _cs } from '@togglecorp/fujs';
import {
    useForm,
    removeNull,
    getErrorObject,
    getErrorString,
    useFormObject,
    SetValueArg,
    internal,
    analyzeErrors,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    useMutation,
} from '@apollo/client';

import {
    SubNavbarIcons,
    SubNavbarActions,
    SubNavbarChildren,
} from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import routes from '#base/configs/routes';
import Svg from '#components/Svg';
import deepLogo from '#resources/img/deep-logo-new.svg';
import {
    FrameworkProperties,
} from '#types/newAnalyticalFramework';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import NewOrganizationSelectInput, { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import PrivacyInput from './components/PrivacyInput';
import UserTable from './UserTable';
import UploadImage from './UploadImage';
import PrimaryTagging from './PrimaryTagging';
import SecondaryTagging from './SecondaryTagging';
import Review from './Review';
import { Framework, FrameworkInput } from '../types';

import NonFieldError from '#components/NonFieldError';
import {
    UpdateFrameworkMutation,
    UpdateFrameworkMutationVariables,
    CreateFrameworkMutation,
    CreateFrameworkMutationVariables,
    AnalysisFrameworkInputType,
} from '#generated/types';
import _ts from '#ts';

import {
    UPDATE_FRAMEWORK,
    CREATE_FRAMEWORK,
} from '../queries';

import schema, { defaultFormValues, PartialFormType, SectionsType, WidgetsType } from './schema';
import styles from './styles.css';

const widgetIdSelector = (w: { id: number }) => w.id;
const widgetLabelSelector = (w: { id: number; title: string }) => w.title;

interface FrameworkFormProps {
    frameworkId: number | undefined;
    framework: Framework | undefined;
}

function transformFramework(framework: Framework): FrameworkInput {
    const {
        title,
        description,
        isPrivate,
        organization,
        primaryTagging,
        secondaryTagging,
        properties,
    } = framework;

    const newValues = removeNull({
        title,
        description,
        isPrivate,
        organization: organization?.id,
        primaryTagging,
        secondaryTagging,
        properties,
        isVisualizationEnabled: isDefined(properties),
    });
    return newValues;
}

function FrameworkForm(props: FrameworkFormProps) {
    const {
        frameworkId,
        framework,
    } = props;

    const { replace: replacePath } = useHistory();
    const alert = useAlert();

    const location = useLocation();

    const initialValue = useMemo(
        (): PartialFormType => {
            if (!framework) {
                return defaultFormValues;
            }
            return transformFramework(framework);
        },
        [framework],
    );

    const [
        frameworkImage,
        setFrameworkImage,
    ] = useState<Framework['previewImage']>(framework?.previewImage);

    const [
        isNavigationDisabled,
        setNavigationDisableState,
    ] = useState(false);

    const [
        organizationOptions,
        setOrganizationOptions,
    ] = useState<BasicOrganization[] | null | undefined>(
        framework?.organization ? [framework.organization] : [],
    );

    const [
        primaryTaggingPristine,
        setPrimaryTaggingPristine,
    ] = useState(true);
    const [
        secondaryTaggingPristine,
        setSecondaryTaggingPristine,
    ] = useState(true);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
        setPristine,
    } = useForm(schema, initialValue);

    const [
        createAnalysisFramework,
        { loading: creatingAnalysisFramework },
    ] = useMutation<CreateFrameworkMutation, CreateFrameworkMutationVariables>(
        CREATE_FRAMEWORK,
        {
            onCompleted: (response) => {
                if (!response?.analysisFrameworkCreate) {
                    return;
                }
                const {
                    errors,
                    ok,
                    result,
                } = response.analysisFrameworkCreate;
                if (!ok && errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                } else if (ok && result) {
                    alert.show(
                        'New analytical framework was successfully created.',
                        {
                            variant: 'success',
                        },
                    );
                    setPristine(true);
                    setPrimaryTaggingPristine(true);
                    setSecondaryTaggingPristine(true);

                    const path = generatePath(
                        routes.analyticalFrameworkEdit.path,
                        { frameworkId: result.id },
                    );
                    replacePath(path);
                }
            },
            onError: (error) => {
                setError({
                    [internal]: error.message,
                });
                alert.show(
                    'There was an error while creating the analytical framework.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const [
        updateAnalysisFramework,
        { loading: updatingAnalysisFramework },
    ] = useMutation<UpdateFrameworkMutation, UpdateFrameworkMutationVariables>(
        UPDATE_FRAMEWORK,
        {
            onCompleted: (response) => {
                if (!response?.analysisFramework?.analysisFrameworkUpdate) {
                    return;
                }
                const {
                    errors,
                    ok,
                    result,
                } = response.analysisFramework.analysisFrameworkUpdate;
                if (!ok && errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                } else if (ok && result) {
                    alert.show(
                        'The analytical framework was successfully updated.',
                        {
                            variant: 'success',
                        },
                    );
                    setFrameworkImage(result.previewImage);
                    setValue(transformFramework(result as Framework));
                    setPrimaryTaggingPristine(true);
                    setSecondaryTaggingPristine(true);
                }
            },
            onError: (error) => {
                setError({
                    [internal]: error.message,
                });
                alert.show(
                    'There was an error while updating the analytical framework.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const pending = creatingAnalysisFramework || updatingAnalysisFramework;

    const error = getErrorObject(riskyError);
    const frameworkPropertiesError = getErrorObject(error?.properties);
    const statsConfigError = getErrorObject(frameworkPropertiesError?.stats_config);

    const handlePrimaryTaggingChange = useCallback(
        (val: SetValueArg<SectionsType | undefined>, name: 'primaryTagging') => {
            setPrimaryTaggingPristine(false);
            setFieldValue(val, name);
        },
        [setFieldValue],
    );

    const handleSecondaryTaggingChange = useCallback(
        (val: SetValueArg<WidgetsType | undefined>, name: 'secondaryTagging') => {
            setSecondaryTaggingPristine(false);
            setFieldValue(val, name);
        },
        [setFieldValue],
    );

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val: PartialFormType) => {
                    const newData = {
                        ...val,
                        isVisualizationEnabled: undefined,
                        primaryTagging: primaryTaggingPristine
                            ? undefined
                            : val.primaryTagging?.map((section) => ({
                                ...section,
                                widgets: section.widgets?.map((widget) => ({
                                    ...widget,
                                    // NOTE: should set conditional to null
                                    // else it will not be cleared
                                    conditional: widget.conditional ? {
                                        ...widget.conditional,
                                        parentWidgetType: undefined,
                                    } : null,
                                })),
                            })),
                        secondaryTagging: secondaryTaggingPristine
                            ? undefined
                            : val.secondaryTagging?.map((widget) => ({
                                ...widget,
                                // NOTE: should set conditional to null else it
                                // will not be cleared
                                conditional: widget.conditional ? {
                                    ...widget.conditional,
                                    parentWidgetType: undefined,
                                } : null,
                            })),
                    };

                    const data = newData as AnalysisFrameworkInputType;

                    if (frameworkId) {
                        updateAnalysisFramework({
                            variables: {
                                id: String(frameworkId),
                                data,
                            },
                            context: {
                                hasUpload: true,
                            },
                        });
                    } else {
                        createAnalysisFramework({
                            variables: {
                                data,
                            },
                            context: {
                                hasUpload: true,
                            },
                        });
                    }
                },
            );
            submit();
        },
        [
            setError, validate, frameworkId,
            primaryTaggingPristine, secondaryTaggingPristine,
            updateAnalysisFramework, createAnalysisFramework,
        ],
    );

    const [
        detailsErrored,
        primaryTaggingErrored,
        secondaryTaggingErrored,
        propertiesErrored,
    ] = useMemo(
        () => {
            const errorWithoutTaggings = { ...error };
            delete errorWithoutTaggings.primaryTagging;
            delete errorWithoutTaggings.secondaryTagging;
            delete errorWithoutTaggings.properties;

            return [
                analyzeErrors(errorWithoutTaggings),
                analyzeErrors(error?.primaryTagging),
                analyzeErrors(error?.secondaryTagging),
                analyzeErrors(error?.properties),
            ];
        },
        [error],
    );

    const onPropertiesChange = useFormObject<'properties', FrameworkProperties>('properties', setFieldValue, {} as FrameworkProperties);
    const onStatsConfigChange = useFormObject('stats_config', onPropertiesChange, {} as FrameworkProperties['stats_config']);

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

    const matrix1dValue = useMemo(() => (
        value.properties?.stats_config?.matrix1d?.map((d) => d.pk).filter(isDefined)
    ), [value.properties?.stats_config]);

    const matrix2dValue = useMemo(() => (
        value.properties?.stats_config?.matrix2d?.map((d) => d.pk).filter(isDefined)
    ), [value.properties?.stats_config]);

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
            onStatsConfigChange(undefined, 'matrix1d');
        } else {
            const transformedNewVal = newVal.map((d) => ({ pk: d }));
            onStatsConfigChange(transformedNewVal, 'matrix2d');
        }
    }, [onStatsConfigChange]);

    const allWidgets = useMemo(() => {
        const widgetsFromPrimary = value.primaryTagging?.flatMap(
            (item) => (item.widgets ?? []),
        ) ?? [];
        const widgetsFromSecondary = value.secondaryTagging ?? [];
        return [
            ...widgetsFromPrimary,
            ...widgetsFromSecondary,
        ];
    }, [value.primaryTagging, value.secondaryTagging]);

    const {
        matrix1dWidgets,
        matrix2dWidgets,
        scaleWidgets,
        geoWidgets,
        organigramWidgets,
        multiSelectWidgets,
    } = useMemo(() => {
        const createdWidgets = allWidgets
            .filter((w) => isDefined(w.id))
            .map((w) => ({
                id: +w.id,
                title: w.title,
                widgetId: w.widgetId,
            }));

        return ({
            matrix1dWidgets: createdWidgets.filter((w) => w.widgetId === 'MATRIX1D'),
            matrix2dWidgets: createdWidgets.filter((w) => w.widgetId === 'MATRIX2D'),
            scaleWidgets: createdWidgets.filter((w) => w.widgetId === 'SCALE'),
            geoWidgets: createdWidgets.filter((w) => w.widgetId === 'GEO'),
            organigramWidgets: createdWidgets.filter((w) => w.widgetId === 'ORGANIGRAM'),
            multiSelectWidgets: createdWidgets.filter((w) => w.widgetId === 'MULTISELECT'),
        });
    }, [allWidgets]);

    return (
        <>
            {pending && <PendingMessage />}
            <Prompt
                message={(newLocation) => {
                    if (newLocation.pathname !== location.pathname && !pristine) {
                        return _ts('common', 'youHaveUnsavedChanges');
                    }
                    return true;
                }}
            />
            <SubNavbarIcons>
                <div className={styles.appBrand}>
                    <Svg
                        src={deepLogo}
                        className={styles.logo}
                    />
                </div>
            </SubNavbarIcons>
            <SubNavbarActions>
                <BackLink
                    defaultLink="/"
                    disabled={isNavigationDisabled}
                >
                    {_ts('analyticalFramework', 'closeButtonLabel')}
                </BackLink>
                <Button
                    disabled={pristine || pending || isNavigationDisabled}
                    name="login"
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            </SubNavbarActions>
            <SubNavbarChildren>
                <Tab
                    name="framework-details"
                    transparentBorder
                    className={_cs(detailsErrored && styles.erroredTab)}
                    disabled={isNavigationDisabled}
                >
                    {_ts('analyticalFramework', 'frameworkDetails')}
                </Tab>
                <Tab
                    name="primary-tagging"
                    transparentBorder
                    className={_cs(primaryTaggingErrored && styles.erroredTab)}
                    disabled={isNavigationDisabled}
                >
                    {_ts('analyticalFramework', 'primaryTagging')}
                </Tab>
                <Tab
                    name="secondary-tagging"
                    transparentBorder
                    className={_cs(secondaryTaggingErrored && styles.erroredTab)}
                    disabled={isNavigationDisabled}
                >
                    {_ts('analyticalFramework', 'secondaryTagging')}
                </Tab>
                <Tab
                    name="review"
                    transparentBorder
                    disabled={isNavigationDisabled}
                >
                    {_ts('analyticalFramework', 'review')}
                </Tab>
                {value.isVisualizationEnabled && (
                    <Tab
                        name="viz-settings"
                        transparentBorder
                        className={_cs(propertiesErrored && styles.erroredTab)}
                        disabled={isNavigationDisabled}
                    >
                        5. Visualization Settings
                    </Tab>
                )}
            </SubNavbarChildren>
            <TabPanel
                activeClassName={_cs(styles.tabPanel, styles.detailsTabPanel)}
                name="framework-details"
            >
                <div className={styles.content}>
                    <div className={styles.details}>
                        <NonFieldError error={error} />
                        <TextInput
                            name="title"
                            onChange={setFieldValue}
                            value={value.title}
                            error={error?.title}
                            disabled={pending}
                            label={_ts('analyticalFramework', 'frameworkTitle')}
                            placeholder={_ts('analyticalFramework', 'frameworkTitle')}
                            autoFocus
                        />
                        <div className={styles.creationDetails}>
                            <TextInput
                                className={styles.createdBy}
                                name="createdBy"
                                value={framework?.createdBy?.displayName}
                                disabled
                                label={_ts('analyticalFramework', 'createdBy')}
                            />
                            <DateInput
                                className={styles.createdOn}
                                name="createdAt"
                                value={framework?.createdAt?.split('T')[0]}
                                disabled
                                label={_ts('analyticalFramework', 'createdOn')}
                            />
                        </div>
                        <NewOrganizationSelectInput
                            name="organization"
                            value={value.organization}
                            onChange={setFieldValue}
                            options={organizationOptions}
                            onOptionsChange={setOrganizationOptions}
                            error={error?.organization}
                            disabled={pending}
                            label={_ts('analyticalFramework', 'associatedOrganization')}
                            placeholder={_ts('analyticalFramework', 'associatedOrganization')}
                        />
                        <TextArea
                            name="description"
                            value={value.description}
                            onChange={setFieldValue}
                            error={error?.description}
                            rows={3}
                            disabled={pending}
                            label={_ts('analyticalFramework', 'description')}
                            placeholder={_ts('analyticalFramework', 'description')}
                        />
                        <PrivacyInput
                            name="isPrivate"
                            value={value.isPrivate}
                            onChange={setFieldValue}
                            error={error?.isPrivate}
                            disabled={pending || !!frameworkId}
                            label={_ts('analyticalFramework', 'frameworkVisibility')}
                        />
                        <Checkbox
                            name="isVisualizationEnabled"
                            value={value.isVisualizationEnabled}
                            onChange={setFieldValue}
                            disabled={pending}
                            label="Is Visualization Enabled"
                        />
                    </div>
                    <UploadImage
                        className={styles.imagePreview}
                        alt={frameworkImage?.name ?? _ts('analyticalFramework', 'previewImage')}
                        name="previewImage"
                        value={value.previewImage}
                        image={frameworkImage?.url}
                        onChange={setFieldValue}
                    />
                </div>
                {framework && (
                    <UserTable
                        className={styles.usersTable}
                        framework={framework}
                    />
                )}
            </TabPanel>
            <TabPanel
                activeClassName={styles.tabPanel}
                name="primary-tagging"
            >
                <PrimaryTagging
                    allWidgets={allWidgets}
                    name="primaryTagging"
                    value={value.primaryTagging}
                    onChange={handlePrimaryTaggingChange}
                    onTempStateChange={setNavigationDisableState}
                    className={styles.view}
                    frameworkId={frameworkId}
                    disabled={pending}
                    error={error?.primaryTagging}
                />
            </TabPanel>
            <TabPanel
                activeClassName={styles.tabPanel}
                name="secondary-tagging"
            >
                <SecondaryTagging
                    allWidgets={allWidgets}
                    name="secondaryTagging"
                    value={value.secondaryTagging}
                    onChange={handleSecondaryTaggingChange}
                    className={styles.view}
                    onTempStateChange={setNavigationDisableState}
                    frameworkId={frameworkId}
                    disabled={pending}
                    error={error?.secondaryTagging}
                />
            </TabPanel>
            <TabPanel
                activeClassName={styles.tabPanel}
                name="review"
            >
                <Review
                    className={styles.view}
                    primaryTagging={value.primaryTagging}
                    secondaryTagging={value.secondaryTagging}
                />
            </TabPanel>
            {value.isVisualizationEnabled && (
                <TabPanel
                    activeClassName={styles.tabPanel}
                    name="viz-settings"
                >
                    <Container
                        heading="Visualization Settings"
                        headingSize="small"
                        headingDescription="NOTE: You'll only be able to see widgetsthat are already created and saved."
                        className={styles.vizSettingsContainer}
                        contentClassName={styles.vizSettings}
                    >
                        <MultiSelectInput
                            label="Matrix 1D"
                            options={matrix1dWidgets}
                            name="matrix1d"
                            value={matrix1dValue}
                            error={getErrorString(statsConfigError?.matrix1d)}
                            onChange={onMatrix1dValueChange}
                            keySelector={widgetIdSelector}
                            labelSelector={widgetLabelSelector}
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
                        />
                        <SelectInput
                            label="Geo Widget"
                            options={geoWidgets}
                            name="geo_widget"
                            value={value.properties?.stats_config?.geo_widget?.pk}
                            error={getErrorString(statsConfigError?.geo_widget)}
                            onChange={onGeoWidgetChange}
                            keySelector={widgetIdSelector}
                            labelSelector={widgetLabelSelector}
                        />
                        <SelectInput
                            label="Severity Widget"
                            options={scaleWidgets}
                            name="severity_widget"
                            value={value.properties?.stats_config?.severity_widget?.pk}
                            error={getErrorString(statsConfigError?.severity_widget)}
                            onChange={onSeverityWidgetChange}
                            keySelector={widgetIdSelector}
                            labelSelector={widgetLabelSelector}
                        />
                        <SelectInput
                            label="Reliability Widget"
                            options={scaleWidgets}
                            name="reliability_widget"
                            value={value.properties?.stats_config?.reliability_widget?.pk}
                            error={getErrorString(statsConfigError?.reliability_widget)}
                            onChange={onReliabilityWidgetChange}
                            keySelector={widgetIdSelector}
                            labelSelector={widgetLabelSelector}
                        />
                        <SelectInput
                            label="Affected Groups"
                            options={organigramWidgets}
                            name="affected_groups_widget"
                            value={value.properties?.stats_config?.affected_groups_widget?.pk}
                            error={getErrorString(statsConfigError?.affected_groups_widget)}
                            onChange={onAffectedGroupsChange}
                            keySelector={widgetIdSelector}
                            labelSelector={widgetLabelSelector}
                        />
                        <SelectInput
                            label="Specific Needs Groups"
                            options={multiSelectWidgets}
                            name="specific_needs_groups_widgets"
                            value={value.properties
                                ?.stats_config?.specific_needs_groups_widgets?.pk}
                            error={getErrorString(statsConfigError?.specific_needs_groups_widgets)}
                            onChange={onSpecificNeedsWidgetChange}
                            keySelector={widgetIdSelector}
                            labelSelector={widgetLabelSelector}
                        />
                    </Container>
                </TabPanel>
            )}
        </>
    );
}

export default FrameworkForm;
