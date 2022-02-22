import React, { useMemo, useState, useCallback, useEffect, useContext } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import {
    useParams,
    generatePath,
    useHistory,
    useLocation,
    Prompt,
} from 'react-router-dom';
import {
    useQuery,
    useMutation,
} from '@apollo/client';
import {
    Tabs,
    useAlert,
    Tab,
    TextArea,
    TextInput,
    DateInput,
    TabPanel,
    Checkbox,
    PendingMessage,
    Button,
    ConfirmButton,
    ElementFragments,
} from '@the-deep/deep-ui';
import {
    useForm,
    removeNull,
    getErrorObject,
    SetValueArg,
    internal,
    analyzeErrors,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import SubNavbar, {
    SubNavbarActions,
    SubNavbarChildren,
} from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import { UserContext } from '#base/context/UserContext';
import routes from '#base/configs/routes';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import NewOrganizationSelectInput, { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import PreloadMessage from '#base/components/PreloadMessage';
import FullPageErrorMessage from '#views/FullPageErrorMessage';
import SubNavbarContext from '#components/SubNavbar/context';
import _ts from '#ts';
import {
    CurrentFrameworkQuery,
    CurrentFrameworkQueryVariables,
    UpdateFrameworkMutation,
    UpdateFrameworkMutationVariables,
    CreateFrameworkMutation,
    CreateFrameworkMutationVariables,
    AnalysisFrameworkInputType,
} from '#generated/types';
import useLock from '#hooks/useLock';
import useAsyncStorage from '#hooks/useAsyncStorage';

import { Framework, FrameworkInput } from './types';
import schema, {
    defaultFormValues,
    PartialFormType,
    SectionsType,
    WidgetsType,
    PropertiesType,
} from './schema';
import {
    CURRENT_FRAMEWORK,
    UPDATE_FRAMEWORK,
    CREATE_FRAMEWORK,
} from './queries';
import PrivacyInput from './components/PrivacyInput';
import UserTable from './UserTable';
import UploadImage from './UploadImage';
import PrimaryTagging from './PrimaryTagging';
import Properties from './Properties';
import SecondaryTagging from './SecondaryTagging';
import Review from './Review';
import AssistedTagging from './AssistedTagging';
import styles from './styles.css';

function getTimestamp(dateString: string | undefined) {
    if (!dateString) {
        return 0;
    }
    return new Date(dateString);
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

interface Stored {
    pristine: boolean,
    primaryTaggingPristine: boolean,
    secondaryTaggingPristine: boolean,
    framework: PartialFormType,
    frameworkImage: Framework['previewImage'],
    organizationOptions: BasicOrganization[] | null | undefined,
}

// TODO: create a parent route for Framework as well

interface Props {
    className?: string;
}

function AnalyticalFramework(props: Props) {
    const {
        className,
    } = props;

    const { replace: replacePath } = useHistory();

    const {
        user,
    } = useContext(UserContext);

    const alert = useAlert();

    const location = useLocation();

    const { frameworkId: frameworkIdFromParams } = useParams<{ frameworkId: string }>();
    const frameworkId = !frameworkIdFromParams ? undefined : +frameworkIdFromParams;
    const createMode = !frameworkIdFromParams;

    // NOTE: userId should be defined in this page
    const userId = user?.id ?? 'NULL';
    // NOTE: no need to set these keys as url but this looks nice
    const key = frameworkId
        ? `user/${userId}/framework/${frameworkId}/edit`
        : `user/${userId}framework/create`;

    const [childrenNode, setChildrenNode] = useState<Element | null | undefined>();
    const [actionsNode, setActionsNode] = useState<Element | null | undefined>();
    const [iconsNode, setIconsNode] = useState<Element | null | undefined>();

    const [
        isNavigationDisabled,
        setNavigationDisableState,
    ] = useState(false);

    const [
        primaryTaggingPristine,
        setPrimaryTaggingPristine,
    ] = useState(true);
    const [
        secondaryTaggingPristine,
        setSecondaryTaggingPristine,
    ] = useState(true);

    const [
        frameworkImage,
        setFrameworkImage,
    ] = useState<Framework['previewImage']>(undefined);

    const [
        organizationOptions,
        setOrganizationOptions,
    ] = useState<BasicOrganization[] | null | undefined>(
        undefined,
    );

    const [cacheUsed, setCacheUsed] = useState(false);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
        setPristine,
    } = useForm(schema, defaultFormValues);

    const lockState = useLock(key);

    const handleAsyncAfLoad = useCallback(
        (storedAfArg: Stored | undefined) => {
            if (storedAfArg) {
                // NOTE: error is not persisted
                setValue(storedAfArg.framework);
                setPristine(storedAfArg.pristine);

                setFrameworkImage(storedAfArg.frameworkImage);
                setOrganizationOptions(storedAfArg.organizationOptions);
                setPrimaryTaggingPristine(storedAfArg.primaryTaggingPristine);
                setSecondaryTaggingPristine(storedAfArg.secondaryTaggingPristine);

                setCacheUsed(true);
            }
        },
        [setValue, setPristine],
    );
    const [
        storedDataPending,
        storedData,
        updateDataStore,
    ] = useAsyncStorage<Stored>(
        lockState !== 'ACQUIRED',
        key,
        1,
        handleAsyncAfLoad,
    );

    const frameworkQueryVariables = useMemo(
        (): CurrentFrameworkQueryVariables => ({
            id: frameworkIdFromParams,
        }),
        [frameworkIdFromParams],
    );
    const {
        loading: frameworkQueryLoading,
        error: frameworkQueryError,
        data: frameworkQueryData,
    } = useQuery<CurrentFrameworkQuery, CurrentFrameworkQueryVariables>(
        CURRENT_FRAMEWORK,
        {
            skip: createMode || storedDataPending,
            variables: frameworkQueryVariables,
            onCompleted: (response) => {
                // eslint-disable-next-line max-len
                const framework = (response.analysisFramework ?? undefined) as Framework | undefined;
                // eslint-disable-next-line max-len
                if (framework && (!storedData || getTimestamp(framework.modifiedAt) > getTimestamp(storedData.framework.modifiedAt))) {
                    setValue(transformFramework(framework));
                    setFrameworkImage(framework?.previewImage);
                    setOrganizationOptions(
                        framework?.organization
                            ? [framework.organization]
                            : [],
                    );
                    setPristine(true);
                    setPrimaryTaggingPristine(true);
                    setSecondaryTaggingPristine(true);

                    if (storedData) {
                        // NOTE: clearing out stored af after new data is fetched
                        updateDataStore(undefined, { immediateWrite: true });
                        setCacheUsed(false);
                        alert.show(
                            'Reading data from server',
                            {
                                variant: 'info',
                            },
                        );
                    }
                }
            },
        },
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
                    // NOTE: clearing out stored af after save is successful
                    updateDataStore(undefined, { immediateWrite: true });
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
                    // NOTE: clearing out stored af after save is successful
                    updateDataStore(undefined, { immediateWrite: true });
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

    useEffect(
        () => {
            if (lockState === 'NOT_SUPPORTED') {
                alert.show(
                    'Unsupported browser! Changes made in this tab will not be locally backed up.',
                    {
                        name: 'af-lock-rejected',
                        variant: 'error',
                        duration: Infinity,
                    },
                );
            }
            if (lockState === 'REJECTED') {
                alert.show(
                    'This page was already open in another tab. Changes made in this tab will not be locally backed up.',
                    {
                        name: 'af-lock-rejected',
                        variant: 'error',
                        duration: Infinity,
                    },
                );
            }

            return () => {
                alert.hide('af-lock-rejected');
            };
        },
        [lockState, alert],
    );

    useEffect(
        () => {
            if (!cacheUsed) {
                return undefined;
            }
            alert.show(
                (
                    <ElementFragments
                        actions={lockState === 'ACQUIRED' && (
                            <ConfirmButton
                                name={undefined}
                                variant="action"
                                contentEditable
                                message="Are you sure you want to reset local backup and refresh the page?"
                                onConfirm={() => {
                                    updateDataStore(
                                        undefined,
                                        {
                                            immediateWrite: true,
                                            onWrite: () => window.location.reload(),
                                        },
                                    );
                                }}
                            >
                                Reset
                            </ConfirmButton>
                        )}
                    >
                        Reading data from local backup.
                    </ElementFragments>
                ),
                {
                    variant: 'info',
                    duration: Infinity,
                    name: 'af-cache-used',
                },
            );
            return () => {
                alert.hide('af-cache-used');
            };
        },
        [
            alert,
            cacheUsed,
            lockState,
            updateDataStore,
        ],
    );

    useEffect(
        () => {
            if (lockState !== 'ACQUIRED') {
                return;
            }
            if (storedDataPending) {
                return;
            }
            if (pristine) {
                return;
            }
            updateDataStore({
                pristine,
                primaryTaggingPristine,
                secondaryTaggingPristine,
                framework: value,
                frameworkImage,
                organizationOptions,
            });
        },
        [
            storedDataPending,
            lockState,
            pristine,
            updateDataStore,
            value,
            primaryTaggingPristine,
            secondaryTaggingPristine,
            frameworkImage,
            organizationOptions,
        ],
    );

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

    const handleAssistedTaggingStatusChange = useCallback(
        (val: boolean) => {
            setFieldValue(val, 'isAssistedTaggingEnabled');
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
                        isAssistedTaggingEnabled: undefined,
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

    const pending = creatingAnalysisFramework || updatingAnalysisFramework;

    const error = getErrorObject(riskyError);

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

    const navbarContextValue = useMemo(
        () => ({
            childrenNode,
            iconsNode,
            actionsNode,
            setChildrenNode,
            setActionsNode,
            setIconsNode,
        }),
        [childrenNode, actionsNode, iconsNode],
    );

    if (frameworkQueryError) {
        return (
            <FullPageErrorMessage
                className={className}
                errorTitle="Oh no!"
                errorMessage="Some error occured"
                krakenVariant="hi"
            />
        );
    }

    if (storedDataPending || frameworkQueryLoading) {
        return (
            <PreloadMessage
                className={className}
                content="Checking framework permissions..."
            />
        );
    }

    const framework = (frameworkQueryData?.analysisFramework ?? undefined) as Framework | undefined;
    const hasPermission = createMode || framework?.allowedPermissions?.includes('CAN_EDIT_FRAMEWORK');

    return (
        <div className={_cs(styles.analyticalFramework, className)}>
            <SubNavbarContext.Provider value={navbarContextValue}>
                <Tabs
                    useHash
                    defaultHash="framework-details"
                >
                    <SubNavbar
                        className={styles.header}
                        heading={(
                            createMode
                                ? _ts('analyticalFramework', 'addNewAnalyticalFramework')
                                : framework?.title
                        )}
                        homeLinkShown
                    />
                    {!hasPermission ? (
                        <FullPageErrorMessage
                            errorTitle="Oh no!"
                            errorMessage="The framework does not exist or you do not have permissions to edit the framework."
                            krakenVariant="hi"
                        />
                    ) : (
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
                                <Tab
                                    name="assisted-tagging"
                                    transparentBorder
                                    disabled={isNavigationDisabled}
                                >
                                    5. Assisted Tagging
                                </Tab>
                                {value.isVisualizationEnabled && (
                                    <Tab
                                        name="viz-settings"
                                        transparentBorder
                                        className={_cs(propertiesErrored && styles.erroredTab)}
                                        disabled={isNavigationDisabled}
                                    >
                                        6. Visualization Settings
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
                            <TabPanel
                                activeClassName={styles.tabPanel}
                                name="assisted-tagging"
                                retainMount="lazy"
                            >
                                <AssistedTagging
                                    frameworkId={framework?.id}
                                    className={styles.view}
                                    allWidgets={allWidgets}
                                    assistedTaggingEnabled={value.isAssistedTaggingEnabled}
                                    onAssistedTaggingStatusChange={
                                        handleAssistedTaggingStatusChange
                                    }
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
                    )}
                </Tabs>
            </SubNavbarContext.Provider>
        </div>
    );
}

export default AnalyticalFramework;
