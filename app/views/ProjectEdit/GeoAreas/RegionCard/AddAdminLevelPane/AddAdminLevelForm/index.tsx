import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined, isFalsyString, isNotDefined } from '@togglecorp/fujs';
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
    removeNull,
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
import {
    ObjectError,
    transformToFormError,
} from '#base/utils/errorTransform';
import NonFieldError from '#components/NonFieldError';
import GalleryFileUpload from '#components/GalleryFileUpload';

import styles from './styles.css';

type AdminLevelWithClientIdType = AdminLevelType & { clientId: string };
type PartialAdminLevel = PartialForm<AdminLevelWithClientIdType>;
type AdminLevelInputTypeSafe = AdminLevelInputType & { id: string };
type PartialAdminLevelInput = PartialForm<AdminLevelInputTypeSafe>;

const CREATE_ADMIN_LEVEL = gql`
    mutation CreateAdminLevel(
        $data: AdminLevelInputType!,
    ) {
        createAdminLevel(data: $data) {
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

type FormSchema = ObjectSchema<PartialAdminLevelInput>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
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

function isGalleryFileValid(
    galleryFile: Partial<GalleryFileType> | undefined | null,
): galleryFile is GalleryFileType {
    if (isNotDefined(galleryFile)) {
        return false;
    }

    if (isNotDefined(galleryFile.id) || isFalsyString(galleryFile.title)) {
        return false;
    }

    return true;
}

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
        geoShapeFile,
        ...remainingValues
    } = valueFromProps;

    const initialFormValue: PartialAdminLevelInput = useMemo(() => (
        {
            ...remainingValues,
            geoShapeFile: geoShapeFile?.id,
            region: regionId,
        }
    ), [geoShapeFile?.id, regionId, remainingValues]);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        setPristine,
        validate,
        setError,
    } = useForm(schema, initialFormValue);

    const [option, setOption] = useState<GalleryFileType | undefined>(
        isGalleryFileValid(geoShapeFile)
            ? geoShapeFile
            : undefined,
    );

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
                if (!response || !response.createAdminLevel) {
                    return;
                }

                const {
                    ok,
                    errors,
                    result,
                } = response.createAdminLevel;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                }

                if (isDefined(result) && ok) {
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
                if (!response || !response.updateAdminLevel) {
                    return;
                }

                const {
                    ok,
                    errors,
                    result,
                } = response.updateAdminLevel;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                }

                if (isDefined(result) && ok) {
                    alert.show(
                        'Admin level is successfully updated!',
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

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => {
                if (isDefined(valueFromProps.id)) {
                    updateAdminLevel({
                        variables: {
                            id: valueFromProps.id,
                            data: {
                                ...val,
                                parentCodeProp: val.parentCodeProp ?? '',
                                parentNameProp: val.parentNameProp ?? '',

                            } as AdminLevelInputType,
                        },
                    });
                } else {
                    createAdminLevel({
                        variables: {
                            data: {
                                ...val,
                                parentCodeProp: val.parentCodeProp ?? '',
                                parentNameProp: val.parentNameProp ?? '',

                            } as AdminLevelInputType,
                        },
                    });
                }
            },
        );
        submit();
    }, [
        setError,
        validate,
        updateAdminLevel,
        createAdminLevel,
        valueFromProps.id,
    ]);

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
                    status
                    option={option}
                    setOption={setOption}
                    acceptFileType=".geojson"
                    title="Upload a geojson file and select the corresponding field names from your geojson file"
                />
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
