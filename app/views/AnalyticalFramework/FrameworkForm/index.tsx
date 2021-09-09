import React, { useMemo, useState, useCallback } from 'react';
import {
    Tab,
    TextArea,
    useAlert,
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
    SetValueArg,
    internal,
    analyzeErrors,
} from '@togglecorp/toggle-form';
import {
    useMutation,
} from '@apollo/client';

import {
    SubNavbarIcons,
    SubNavbarActions,
    SubNavbarChildren,
} from '#components/SubNavbar';
import routes from '#base/configs/routes';
import Svg from '#components/Svg';
import deepLogo from '#resources/img/deep-logo-new.svg';
import { transformToFormError } from '#base/utils/errorTransform';
import NewOrganizationSelectInput, { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import PrivacyInput from './components/PrivacyInput';
import UserTable from './UserTable';
// import UploadImage from './UploadImage';
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
    } = framework;

    return removeNull({
        title,
        description,
        isPrivate,
        organization: organization?.id,
        primaryTagging,
        secondaryTagging,
    });
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
                    const formError = transformToFormError(removeNull(errors));
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
                    const formError = transformToFormError(removeNull(errors));
                    setError(formError);
                } else if (ok && result) {
                    alert.show(
                        'The analytical framework was successfully updated.',
                        {
                            variant: 'success',
                        },
                    );
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
            setSecondaryTaggingPristine(false);
            setFieldValue(val, name);
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

    const [
        detailsErrored,
        primaryTaggingErrored,
        secondaryTaggingErrored,
    ] = useMemo(
        () => {
            const errorWithoutTaggings = { ...error };
            delete errorWithoutTaggings.primaryTagging;
            delete errorWithoutTaggings.secondaryTagging;

            return [
                analyzeErrors(errorWithoutTaggings),
                analyzeErrors(error?.primaryTagging),
                analyzeErrors(error?.secondaryTagging),
            ];
        },
        [error],
    );

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
            <SubNavbarIcons>
                <div className={styles.appBrand}>
                    <Svg
                        src={deepLogo}
                        className={styles.logo}
                    />
                </div>
            </SubNavbarIcons>
            <SubNavbarActions>
                <Button
                    disabled={pristine || pending}
                    name="login"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </SubNavbarActions>
            <SubNavbarChildren>
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
            </SubNavbarChildren>
            <TabPanel
                className={_cs(styles.tabPanel, styles.detailsTabPanel)}
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
                        className={styles.usersTable}
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
                    error={error?.secondaryTagging}
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
