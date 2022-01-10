import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
    Tab,
    TextArea,
    useAlert,
    TextInput,
    DateInput,
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
    SetValueArg,
    internal,
    analyzeErrors,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    useMutation,
} from '@apollo/client';

import {
    SubNavbarActions,
    SubNavbarChildren,
} from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import routes from '#base/configs/routes';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import NewOrganizationSelectInput, { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import PrivacyInput from './components/PrivacyInput';
import UserTable from './UserTable';
import UploadImage from './UploadImage';
import PrimaryTagging from './PrimaryTagging';
import Properties from './Properties';
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

import schema, { defaultFormValues, PartialFormType, SectionsType, WidgetsType, PropertiesType } from './schema';
import styles from './styles.css';

function getTimestamp(dateString: string | undefined) {
    if (!dateString) {
        return 0;
    }
    return new Date(dateString);
}

interface FrameworkFormProps {
    frameworkId: number | undefined;
    framework: Framework | undefined;
    initialAf: PartialFormType | undefined;
    onAfChange: (value: PartialFormType) => void;
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
        modifiedAt,
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
        modifiedAt,
    });
    return newValues;
}

function FrameworkForm(props: FrameworkFormProps) {
    const {
        frameworkId,
        framework,
        onAfChange,
        initialAf,
    } = props;

    const { replace: replacePath } = useHistory();
    const alert = useAlert();

    const location = useLocation();

    const initialValue = useMemo(
        (): PartialFormType => {
            // eslint-disable-next-line max-len
            if (initialAf && (!framework || getTimestamp(initialAf.modifiedAt) >= getTimestamp(framework.modifiedAt))) {
                return initialAf;
            }
            // eslint-disable-next-line max-len
            if (framework && (!initialAf || getTimestamp(framework.modifiedAt) > getTimestamp(initialAf.modifiedAt))) {
                return transformFramework(framework);
            }
            return defaultFormValues;
        },
        [framework, initialAf],
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

    useEffect(
        () => {
            onAfChange(value);
        },
        [onAfChange, value],
    );

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
                        'Successfully created new analytical framework.',
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
                        'Successfully updated the analytical framework.',
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

    const handlePrimaryTaggingChange = useCallback(
        (val: SetValueArg<SectionsType | undefined>, name: 'primaryTagging') => {
            setPrimaryTaggingPristine(false);
            setFieldValue(val, name);
        },
        [setFieldValue],
    );

    const handleSecondaryTaggingChange = useCallback(
        (val: SetValueArg<WidgetsType | undefined>, name: 'secondaryTagging') => {
            setFieldValue(val, name);
        },
        [setFieldValue],
    );

    const handlePropertiesChange = useCallback(
        (val: SetValueArg<PropertiesType | undefined>, name: 'properties') => {
            // NOTE: inject custom logic here
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
                        modifiedAt: undefined,
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
            <SubNavbarActions>
                <BackLink
                    defaultLink="/"
                    disabled={isNavigationDisabled}
                >
                    Close
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
                retainMount="lazy"
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
                retainMount="lazy"
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
                retainMount="lazy"
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
                retainMount="lazy"
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
                    retainMount="lazy"
                >
                    <Properties
                        allWidgets={allWidgets}
                        name="properties"
                        onChange={handlePropertiesChange}
                        value={value?.properties}
                        error={error?.properties}
                        disabled={pending}
                    />
                </TabPanel>
            )}
        </>
    );
}

export default FrameworkForm;
