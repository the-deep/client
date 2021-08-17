import React, { useMemo, useState, useCallback } from 'react';
import {
    Tab,
    TextArea,
    TextInput,
    DateInput,
    TabPanel,
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
    // PartialForm,
    SetValueArg,
    internal,
    analyzeErrors,
} from '@togglecorp/toggle-form';
import {
    useMutation,
} from '@apollo/client';

import { Actions, Children } from '#components/SubNavbar';
import routes from '#base/configs/routes';
import { transformToFormError } from '#base/utils/errorTransform';
import NewOrganizationSelectInput, { BasicOrganization } from '#components/NewOrganizationSelectInput';
import PrivacyInput from './components/PrivacyInput';
import UserTable from './UserTable';
// import UploadImage from './UploadImage';
import PrimaryTagging from './PrimaryTagging';
import SecondaryTagging from './SecondaryTagging';
import Review from './Review';
import { Framework } from '../types';

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

interface FrameworkFormProps {
    frameworkId: number | undefined;
    framework: Framework | undefined;
}

function transformFramework(framework: Framework) {
    const {
        title,
        description,
        isPrivate,
        organization,
        primaryTagging,
        secondaryTagging,
    } = framework;

    return removeNull({
        title,
        description,
        isPrivate,
        organization: organization?.id,
        // FIXME: these empty array are side-effects of new PartialForm
        primaryTagging: primaryTagging ?? [],
        secondaryTagging: secondaryTagging ?? [],
    });
}

function FrameworkForm(props: FrameworkFormProps) {
    const {
        frameworkId,
        framework,
    } = props;

    const { replace: replacePath } = useHistory();

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
        organizationOptions,
        setOrganizationOptions,
    ] = useState<BasicOrganization[] | null | undefined>(
        [framework?.organization].filter(isDefined),
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
                    const formError = transformToFormError(removeNull(errors));
                    setError(formError);
                } else if (ok && result) {
                    const path = generatePath(
                        routes.analyticalFrameworkEdit.path,
                        { frameworkId: result.id },
                    );
                    replacePath(path);
                }
            },
            onError: (error) => {
                console.error(error);
                setError({
                    [internal]: error.message,
                });
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
                    const formError = transformToFormError(removeNull(errors));
                    setError(formError);
                } else if (ok && result) {
                    setValue(transformFramework(result));
                    setPrimaryTaggingPristine(true);
                    setSecondaryTaggingPristine(true);
                }
            },
            onError: (error) => {
                console.warn(error);
                setError({
                    [internal]: error.message,
                });
            },
        },
    );

    const pending = creatingAnalysisFramework || updatingAnalysisFramework;

    const error = getErrorObject(riskyError);

    const handlePrimaryTaggingChange = useCallback(
        (val: SetValueArg<SectionsType>, key: 'primaryTagging') => {
            setPrimaryTaggingPristine(false);
            setFieldValue(val, key);
        },
        [setFieldValue],
    );

    const handleSecondaryTaggingChange = useCallback(
        (val: SetValueArg<WidgetsType>, key: 'secondaryTagging') => {
            setSecondaryTaggingPristine(false);
            setFieldValue(val, key);
        },
        [setFieldValue],
    );

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            setError(err);
            if (!errored && isDefined(val)) {
                // NOTE: clearing out these data so they don't override
                const data = { ...val } as AnalysisFrameworkInputType;
                if (primaryTaggingPristine) {
                    delete data.primaryTagging;
                }
                if (secondaryTaggingPristine) {
                    delete data.secondaryTagging;
                }

                if (frameworkId) {
                    updateAnalysisFramework({
                        variables: {
                            id: String(frameworkId),
                            data,
                        },
                    });
                } else {
                    createAnalysisFramework({
                        variables: {
                            data,
                        },
                    });
                }
            }
        },
        [
            setError, validate, frameworkId,
            primaryTaggingPristine, secondaryTaggingPristine,
            updateAnalysisFramework, createAnalysisFramework,
        ],
    );

    const errorWithoutTaggings = { ...error };
    delete errorWithoutTaggings.primaryTagging;
    delete errorWithoutTaggings.secondaryTagging;

    const detailsErrored = analyzeErrors(error);
    const primaryTaggingErrored = analyzeErrors(error?.primaryTagging);
    const secondaryTaggingErrored = analyzeErrors(error?.secondaryTagging);

    return (
        <>
            <Prompt
                message={(newLocation) => {
                    if (newLocation.pathname !== location.pathname && !pristine) {
                        return _ts('common', 'youHaveUnsavedChanges');
                    }
                    return true;
                }}
            />
            <Actions>
                <Button
                    disabled={pristine || pending}
                    name="login"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </Actions>
            <Children>
                <Tab
                    name="framework-details"
                    transparentBorder
                    className={_cs(detailsErrored && styles.erroredTab)}
                >
                    {_ts('analyticalFramework', 'frameworkDetails')}
                </Tab>
                <Tab
                    name="primary-tagging"
                    transparentBorder
                    className={_cs(primaryTaggingErrored && styles.erroredTab)}
                >
                    {_ts('analyticalFramework', 'primaryTagging')}
                </Tab>
                <Tab
                    name="secondary-tagging"
                    transparentBorder
                    className={_cs(secondaryTaggingErrored && styles.erroredTab)}
                >
                    {_ts('analyticalFramework', 'secondaryTagging')}
                </Tab>
                <Tab
                    name="review"
                    transparentBorder
                >
                    {_ts('analyticalFramework', 'review')}
                </Tab>
            </Children>
            <TabPanel
                className={styles.tabPanel}
                name="framework-details"
            >
                <div className={styles.content}>
                    <div className={styles.details}>
                        <NonFieldError
                            error={error}
                        />
                        <TextInput
                            name="title"
                            onChange={setFieldValue}
                            value={value.title}
                            error={error?.title}
                            disabled={pending}
                            label={_ts('analyticalFramework', 'frameworkTitle')}
                            placeholder={_ts('analyticalFramework', 'frameworkTitle')}
                            autoFocus
                            className={styles.input}
                        />
                        <div className={styles.creationDetails}>
                            <TextInput
                                className={styles.createdBy}
                                name="createdBy"
                                value={framework?.createdBy?.displayName}
                                readOnly
                                disabled={pending}
                                label={_ts('analyticalFramework', 'createdBy')}
                            />
                            <DateInput
                                className={styles.createdOn}
                                name="createdAt"
                                value={framework?.createdAt?.split('T')[0]}
                                readOnly
                                disabled={pending}
                                label={_ts('analyticalFramework', 'createdOn')}
                            />
                        </div>
                        <NewOrganizationSelectInput
                            className={styles.input}
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
                            className={styles.input}
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
                            className={styles.input}
                            name="isPrivate"
                            value={value.isPrivate}
                            onChange={setFieldValue}
                            error={error?.isPrivate}
                            disabled={pending}
                            label={_ts('analyticalFramework', 'frameworkVisibility')}
                        />
                    </div>
                    <div className={styles.imagePreview} />
                    {/*
                    <UploadImage
                        className={styles.imagePreview}
                        alt={_ts('analyticalFramework', 'previewImage')}
                        name="previewImage"
                        value={value.previewImage}
                        image={framework?.previewImage}
                        onChange={setFieldValue}
                        disabled={pending}
                    />
                    */}
                </div>
                {framework && (
                    <UserTable
                        framework={framework}
                    />
                )}
            </TabPanel>
            <TabPanel
                className={styles.tabPanel}
                name="primary-tagging"
            >
                <PrimaryTagging
                    name="primaryTagging"
                    value={value.primaryTagging}
                    onChange={handlePrimaryTaggingChange}
                    className={styles.view}
                    frameworkId={frameworkId}
                    disabled={pending}
                    error={error?.primaryTagging}
                />
            </TabPanel>
            <TabPanel
                className={styles.tabPanel}
                name="secondary-tagging"
            >
                <SecondaryTagging
                    name="secondaryTagging"
                    value={value.secondaryTagging}
                    onChange={handleSecondaryTaggingChange}
                    className={styles.view}
                    frameworkId={frameworkId}
                    disabled={pending}
                    error={error?.primaryTagging}
                />
            </TabPanel>
            <TabPanel
                className={styles.tabPanel}
                name="review"
            >
                <Review
                    className={styles.view}
                    primaryTagging={value.primaryTagging}
                    secondaryTagging={value.secondaryTagging}
                />
            </TabPanel>
        </>
    );
}

export default FrameworkForm;