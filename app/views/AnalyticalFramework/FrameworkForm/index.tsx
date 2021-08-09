import React, { useMemo } from 'react';
import {
    TextArea,
    TextInput,
    DateInput,
    Container,
    Tag,
    TabPanel,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    ArraySchema,
    requiredStringCondition,
    useForm,
    PurgeNull,
    removeNull,
    getErrorObject,
    // PartialForm,
} from '@togglecorp/toggle-form';
import {
    useMutation,
} from '@apollo/client';

import FrameworkDetails from '../FrameworkDetails';
import PrimaryTagging from '../PrimaryTagging';
import SecondaryTagging from '../SecondaryTagging';
import Review from '../Review';
import { Framework } from '../types';
import {
    AnalysisFrameworkInputType,
    UpdateFrameworkMutation,
    UpdateFrameworkMutationVariables,
    CreateFrameworkMutation,
    CreateFrameworkMutationVariables,
} from '#generated/types';
import _ts from '#ts';

import {
    UPDATE_FRAMEWORK,
    CREATE_FRAMEWORK,
} from '../queries';

import styles from './styles.css';

type Intersects<A, B> = A extends B ? true : never;

// eslint-disable-next-line @typescript-eslint/ban-types
export type PartialForm<T, J extends string = 'uuid'> = T extends object ? (
    T extends (infer K)[] ? (
        PartialForm<K, J>[]
    ) : (
        Intersects<J, keyof T> extends true ? (
            { [P in Exclude<keyof T, J>]?: PartialForm<T[P], J> }
            & { [P in (keyof T & J)]: NonNullable<T[P]> }
        ) : (
            { [P in keyof T]?: PartialForm<T[P], J> }
        )
    )
) : T;

type FormType = PurgeNull<AnalysisFrameworkInputType>;

type PartialFormType = PartialForm<FormType, 'clientId' | 'widget_id'>;
type PartialWidgetType = PartialForm<NonNullable<FormType['secondaryTagging']>[number], 'clientId' | 'widget_id'>;
type PartialSectionType = PartialForm<NonNullable<FormType['primaryTagging']>[number], 'clientId' | 'widget_id'>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type WidgetSchema = ObjectSchema<PartialWidgetType>;
type WidgetSchemaFields = ReturnType<WidgetSchema['fields']>;
const widgetSchema: WidgetSchema = {
    fields: (): WidgetSchemaFields => ({
        clientId: [],
        id: [],
        key: [],
        order: [],
        properties: [],
        title: [],
        widgetId: [],
    }),
};

type WidgetsSchema = ArraySchema<PartialWidgetType>;
type WidgetsSchemaMember = ReturnType<WidgetsSchema['member']>;
const widgetsSchema: WidgetsSchema = {
    keySelector: (col) => col.clientId,
    member: (): WidgetsSchemaMember => widgetSchema,
};

type SectionSchema = ObjectSchema<PartialSectionType>;
type SectionSchemaFields = ReturnType<SectionSchema['fields']>;
const sectionSchema: SectionSchema = {
    fields: (): SectionSchemaFields => ({
        clientId: [],
        id: [],
        order: [],
        title: [],
        tooltip: [],
        widgets: widgetsSchema,
    }),
};

type SectionsSchema = ArraySchema<PartialSectionType>;
type SectionsSchemaMember = ReturnType<SectionsSchema['member']>;
const sectionsSchema: SectionsSchema = {
    keySelector: (col) => col.clientId,
    member: (): SectionsSchemaMember => sectionSchema,
};

const defaultFormValues: PartialFormType = {
    // FIXME: remove this later
    clientId: 'test',
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        // TODO: does not work right now
        // previewImage: [],
        // FIXME: remove this later
        clientId: [],

        title: [requiredStringCondition],
        description: [],
        isPrivate: [],
        organization: [],

        primaryTagging: sectionsSchema,
        secondaryTagging: widgetsSchema,
    }),
};

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
                // FIXME: remove this later
                clientId: 'test',
                title,
                description,
                isPrivate,
                organization: organization?.id,
                primaryTagging: primaryTagging?.map((section) => ({
                    ...section,
                    // FIXME: remove this later
                    id: +(section.id),
                    // FIXME: remove this later
                    clientId: section.clientId ?? 'test',
                    widgets: section.widgets?.map((widget) => ({
                        ...widget,
                        // FIXME: remove this later
                        id: +(widget.id),
                        // FIXME: remove this later
                        clientId: widget.clientId ?? 'test',
                    })),
                })),
                secondaryTagging: secondaryTagging?.map((widget) => ({
                    ...widget,
                    // FIXME: remove this later
                    id: +(widget.id),
                    // FIXME: remove this later
                    clientId: widget.clientId ?? 'test',
                })),
            });
        },
        [framework],
    );

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setValue,
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

    const pending = false;

    console.log(
        pristine, value, riskyError, setFieldValue, validate, setValue, setError,
        updateAnalysisFramework, updatingAnalysisFramework,
        createAnalysisFramework, creatingAnalysisFramework,
    );

    const error = getErrorObject(riskyError);

    return (
        <>
            <TabPanel
                className={styles.tabPanel}
                name="framework-details"
            >
                <div className={styles.details}>
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
                            label={_ts('analyticalFramework', 'createdBy')}
                        />
                        <DateInput
                            className={styles.createdOn}
                            name="createdAt"
                            value={framework?.createdAt?.split('T')[0]}
                            readOnly
                            label={_ts('analyticalFramework', 'createdOn')}
                        />
                    </div>
                    <OrganizationSelectInput
                        className={styles.input}
                        name="organization"
                        value={value.organization}
                        onChange={setFieldValue}
                        options={organizationOptions ?? projectOrganizations}
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
                <FrameworkDetails
                    // className={styles.view}
                    frameworkId={frameworkId}
                />
            </TabPanel>
            <TabPanel
                className={styles.tabPanel}
                name="primary-tagging"
            >
                <PrimaryTagging
                    className={styles.view}
                    frameworkId={frameworkId}
                />
            </TabPanel>
            <TabPanel
                className={styles.tabPanel}
                name="secondary-tagging"
            >
                <SecondaryTagging
                    className={styles.view}
                    frameworkId={frameworkId}
                />
            </TabPanel>
            <TabPanel
                className={styles.tabPanel}
                name="review"
            >
                <Review
                    className={styles.view}
                />
            </TabPanel>
        </>
    );
}

export default FrameworkForm;
