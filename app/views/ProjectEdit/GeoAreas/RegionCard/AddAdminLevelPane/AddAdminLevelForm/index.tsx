import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';
import {
    Button,
    NumberInput,
    TextInput,
    SelectInput,
    ContainerCard,
    ConfirmButton,
    useAlert,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    requiredCondition,
    useForm,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import { gql, useMutation } from '@apollo/client';
import {
    AdminLevelInputType,
    CreateAdminLevelMutation,
    UpdateAdminLevelMutation,
    UpdateAdminLevelMutationVariables,
    CreateAdminLevelMutationVariables,
    GalleryFileType,
    AdminLevelType,
} from '#generated/types';
import NonFieldError from '#components/NonFieldError';
import GalleryFileUpload from '#components/GalleryFileUpload';

import styles from './styles.css';

type AdminLevel = AdminLevelInputType & { clientId: string, id: string};
type PartialAdminLevel = PartialForm<AdminLevel, 'clientId' | 'geoShapeFile'>;

const CREATE_ADMIN_LEVEL = gql`
    mutation CreateAdminLevel(
        $data: AdminLevelInputType!
    ) {
        createAdminLevel(
            data: $data
        ) {
                ok
                errors
                result {
                    tolerance
                    title
                    staleGeoAreas
                    parentNameProp
                    parentCodeProp
                    codeProp
                    nameProp
                    geoShapeFile {
                        file {
                            url
                        }
                        id
                        title
                        mimeType
                    }
                    level
                    id
                }
            }
        }
`;

const UPDATE_ADMIN_LEVEL = gql`
    mutation UpdateAdminLevel(
        $data: AdminLevelInputType!,
        $id: ID!,
    ) {
        updateAdminLevel(
            data: $data,
            id: $id,
        ) {
                ok
                errors
                result {
                    tolerance
                    title
                    staleGeoAreas
                    parentNameProp
                    parentCodeProp
                    codeProp
                    nameProp
                    geoShapeFile {
                        file {
                            url
                        }
                        id
                        title
                        mimeType
                    }
                    level
                    id
                }
            }
        }
`;

export interface FileUploadResponse {
    id: number;
    title: string;
    file: string;
    mimeType: string;
}

type FormSchema = ObjectSchema<PartialAdminLevel>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        clientId: [],
        region: [requiredStringCondition],
        title: [requiredStringCondition],
        level: [requiredCondition],
        geoShapeFile: [],
        nameProp: [],
        codeProp: [],
        parent: [],
        parentNameProp: [],
        parentCodeProp: [],
    }),
};

const adminLevelKeySelector = (d: AdminLevelType) => d.id;
const adminLevelLabelSelector = (d: AdminLevelType) => d.title;

interface Props {
    regionId: string;
    onSave: (adminLevel: AdminLevelType) => void;
    onDelete: (id: string | undefined) => void;
    value: PartialAdminLevel;
    isPublished?: boolean;
    adminLevelOptions?: AdminLevelType[];
}

function AddAdminLevelForm(props: Props) {
    const {
        regionId,
        adminLevelOptions,
        onSave,
        value: valueFromProps,
        isPublished,
        onDelete,
    } = props;

    const {
        projectId,
    } = useParams<{
        projectId: string | undefined,
    }>();

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        setPristine,
        validate,
        setError,
    } = useForm(schema, { ...valueFromProps, region: regionId });

    const error = getErrorObject(riskyError);
    const alert = useAlert();

    const [
        createAdminLevel,
        {
            loading: createAdminLevelPending,
        },
    ] = useMutation<CreateAdminLevelMutation, CreateAdminLevelMutationVariables>(
        CREATE_ADMIN_LEVEL,
        {
            onCompleted: (response) => {
                if (!response || !response.createAdminLevel || !response.createAdminLevel.result) {
                    return;
                }

                const {
                    ok,
                    errors,
                    result,
                } = response.createAdminLevel;

                if (errors) {
                    alert.show(
                        'Failed to create admin level.',
                        { variant: 'error' },
                    );
                }

                if (ok) {
                    alert.show(
                        'Admin level is successfully created!',
                        { variant: 'success' },
                    );
                    onSave(result);
                    setPristine(true);
                }
            },
            onError: () => {
                alert.show(
                    'Failed to create admin level.',
                    { variant: 'error' },
                );
            },
        },
    );

    const [
        updateAdminLevel,
        {
            loading: updateAdminLevelPending,
        },
    ] = useMutation<UpdateAdminLevelMutation, UpdateAdminLevelMutationVariables>(
        UPDATE_ADMIN_LEVEL,
        {
            onCompleted: (response) => {
                if (!response || !response.updateAdminLevel || !response.updateAdminLevel.result) {
                    return;
                }

                const {
                    ok,
                    errors,
                    result,
                } = response.updateAdminLevel;

                if (errors) {
                    alert.show(
                        'Failed to update admin level.',
                        { variant: 'error' },
                    );
                }

                if (ok) {
                    alert.show(
                        'Admin level is successfully update!',
                        { variant: 'success' },
                    );
                    onSave(result);
                    setPristine(true);
                }
            },
            onError: () => {
                alert.show(
                    'Failed to update admin level.',
                    { variant: 'error' },
                );
            },
        },
    );

    // const {
    //     trigger: addAdminLevelTrigger,
    // } = useLazyRequest<AdminLevelGeoArea, PartialAdminLevel>({
    //     url: isDefined(valueFromProps.id)
    //         ? `server://admin-levels/${valueFromProps.id}/`
    //         : 'server://admin-levels/',
    //     method: isDefined(valueFromProps.id)
    //         ? 'PATCH'
    //         : 'POST',
    //     body: (ctx) => ctx,
    //     onSuccess: (response) => {
    //         onSave(response);
    //         setPristine(true);
    //         alert.show(
    //             isDefined(valueFromProps.id)
    //                 ? 'Successfully updated admin level.'
    //                 : 'Successfully created admin level.',
    //             { variant: 'success' },
    //         );
    //     },
    //     failureMessage: isDefined(valueFromProps.id)
    //         ? 'Failed to  update admin level'
    //         : 'Failed to create admin level',
    // });

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => {
                if (isDefined(valueFromProps.id)) {
                    updateAdminLevel({
                        variables: {
                            id: valueFromProps.id,
                            data: val,
                        },
                    });
                } else {
                    createAdminLevel({
                        variables: {
                            data: val,
                        },
                    });
                }
            },
        );
        submit();
    }, [setError, validate, updateAdminLevel, createAdminLevel, valueFromProps.id]);

    const pending = createAdminLevelPending || updateAdminLevelPending;

    const parentOptions = adminLevelOptions?.filter((v) => v.id !== valueFromProps.id);

    const handleAdminLevelDelete = useCallback(() => {
        onDelete(valueFromProps.id);
    }, [onDelete, valueFromProps.id]);

    const handleFileInputChange = useCallback(
        (geoShapeValue: NonNullable<GalleryFileType>) => {
            setFieldValue(geoShapeValue.id, 'geoShapeFile');
        }, [
            setFieldValue,
        ],
    );

    return (
        <ContainerCard
            className={styles.form}
            footerActions={!isPublished && (
                <>
                    <ConfirmButton
                        name={undefined}
                        onConfirm={handleAdminLevelDelete}
                        message="Are you sure you want to remove this admin level?"
                        disabled={pending}
                        variant="transparent"
                    >
                        {value.id ? 'Delete' : 'Cancel'}
                    </ConfirmButton>
                    <Button
                        name="submit"
                        onClick={handleSubmit}
                        disabled={pristine || pending}
                        variant="transparent"
                    >
                        Save
                    </Button>
                </>
            )}
        >
            <NonFieldError error={error} />
            {!isPublished && (
                <GalleryFileUpload
                    onSuccess={handleFileInputChange}
                    projectIds={projectId ? [projectId] : undefined}
                    disabled={pending}
                    acceptFileType=".geojson"
                    title="Upload a geojson file and select the corresponding field names from your geojson file"
                />
                // <DeepFileInput
                //     name="geoShapeFile"
                //     className={styles.input}
                //     label="Upload a geojson file and select the corresponding field
                //     names from your geojson file"
                //     onChange={setFieldValue}
                //     option={fileUploadOption}
                //     setOption={setFileUploadOption}
                //     value={value.geoShapeFile}
                //     readOnly={isPublished}
                //     disabled={pending}
                //     maxFileSize={25}
                // >
                //     <MdFileUpload />
                // </DeepFileInput>
            )}
            <div className={styles.row}>
                <NumberInput
                    name="level"
                    className={styles.input}
                    value={value.level}
                    error={error?.level}
                    onChange={setFieldValue}
                    label="Admin Level"
                    readOnly={isPublished}
                    disabled={pending}
                />
                <TextInput
                    name="title"
                    className={styles.input}
                    value={value.title}
                    error={error?.title}
                    onChange={setFieldValue}
                    label="Admin Level Name"
                    readOnly={isPublished}
                    disabled={pending}
                />
            </div>
            <div className={styles.row}>
                <TextInput
                    name="codeProp"
                    className={styles.input}
                    value={value.codeProp}
                    error={error?.codeProp}
                    onChange={setFieldValue}
                    label="Pcode Property"
                    readOnly={isPublished}
                    disabled={pending}
                />
                <TextInput
                    name="nameProp"
                    className={styles.input}
                    value={value.nameProp}
                    error={error?.nameProp}
                    onChange={setFieldValue}
                    label="Name Property"
                    readOnly={isPublished}
                    disabled={pending}
                />
            </div>
            <div className={styles.row}>
                <TextInput
                    name="parentCodeProp"
                    className={styles.input}
                    value={value.parentCodeProp}
                    error={error?.parentCodeProp}
                    onChange={setFieldValue}
                    label="Parent Pcode Property"
                    readOnly={isPublished}
                    disabled={pending}
                />
                <TextInput
                    name="parentNameProp"
                    className={styles.input}
                    value={value.parentNameProp}
                    error={error?.parentNameProp}
                    onChange={setFieldValue}
                    label="Parent Name Property"
                    readOnly={isPublished}
                    disabled={pending}
                />
            </div>
            <div className={styles.row}>
                <SelectInput
                    name="parent"
                    className={styles.input}
                    value={value.parent}
                    error={error?.parent}
                    onChange={setFieldValue}
                    options={parentOptions}
                    keySelector={adminLevelKeySelector}
                    labelSelector={adminLevelLabelSelector}
                    label="Parent Name"
                    readOnly={isPublished}
                    disabled={pending}
                />
            </div>
        </ContainerCard>
    );
}

export default AddAdminLevelForm;
