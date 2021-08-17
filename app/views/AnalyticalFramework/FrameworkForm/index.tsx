import React, { useMemo, useState, useCallback } from 'react';
import {
    TextArea,
    TextInput,
    DateInput,
    Container,
    Tag,
    TabPanel,
    Button,
} from '@the-deep/deep-ui';
import { isDefined } from '@togglecorp/fujs';
import {
    useForm,
    removeNull,
    getErrorObject,
    // PartialForm,
    SetValueArg,
} from '@togglecorp/toggle-form';
import {
    useMutation,
} from '@apollo/client';

import NewOrganizationSelectInput, { BasicOrganization } from '#components/NewOrganizationSelectInput';
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

function FrameworkForm(props: FrameworkFormProps) {
    const {
        frameworkId,
        framework,
    } = props;

    const initialValue = useMemo(
        (): PartialFormType => {
            if (!framework) {
                return defaultFormValues;
            }
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
    } = useForm(schema, initialValue);

    const [
        createAnalysisFramework,
        { loading: creatingAnalysisFramework },
    ] = useMutation<CreateFrameworkMutation, CreateFrameworkMutationVariables>(
        CREATE_FRAMEWORK,
        {
            onCompleted: (response) => {
                console.log(response);
            },
            onError: (error) => {
                console.error(error);
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
                console.log(response);
            },
            onError: (error) => {
                console.error(error);
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
                const data = { ...value } as AnalysisFrameworkInputType;
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
            setError, validate, value, frameworkId,
            primaryTaggingPristine, secondaryTaggingPristine,
            updateAnalysisFramework, createAnalysisFramework,
        ],
    );

    return (
        <>
            <Button
                disabled={pristine || pending}
                name="login"
                onClick={handleSubmit}
            >
                Submit
            </Button>
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
                        <Container
                            className={styles.frameworkVisibility}
                            headingClassName={styles.heading}
                            contentClassName={styles.items}
                            heading={_ts('analyticalFramework', 'frameworkVisibility')}
                        >
                            <Tag
                                variant={value?.isPrivate ? 'default' : 'complement1'}
                            >
                                {_ts('analyticalFramework', 'publicFramework')}
                            </Tag>
                            <Tag variant={value?.isPrivate ? 'complement1' : 'default'}>
                                {_ts('analyticalFramework', 'privateFramework')}
                            </Tag>
                        </Container>
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
