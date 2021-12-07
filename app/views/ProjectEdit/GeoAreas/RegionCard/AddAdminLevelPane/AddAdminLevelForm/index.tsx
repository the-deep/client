import React, { useCallback, useState } from 'react';
import { isDefined } from '@togglecorp/fujs';

import {
    MdFileUpload,
} from 'react-icons/md';
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
import NonFieldError from '#components/NonFieldError';
import DeepFileInput from '#components/general/DeepFileInput';
import { useLazyRequest } from '#base/utils/restRequest';
import {
    AdminLevelGeoArea,
} from '#types';

import styles from './styles.css';

type AdminLevel = AdminLevelGeoArea & { clientId: string };
type PartialAdminLevel = PartialForm<AdminLevel, 'clientId' | 'geoShapeFileDetails'>;

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
        title: [requiredStringCondition],
        level: [requiredCondition],
        nameProp: [],
        codeProp: [],
        region: [requiredCondition],
        parent: [],
        geoShapeFile: [],
    }),
};

const adminLevelKeySelector = (d: AdminLevelGeoArea) => d.id;
const adminLevelLabelSelector = (d: AdminLevelGeoArea) => d.title;

interface Props {
    onSave: (adminLevel: AdminLevelGeoArea) => void;
    onDelete: (id: number | undefined) => void;
    value: PartialAdminLevel;
    isPublished?: boolean;
    adminLevelOptions?: AdminLevelGeoArea[];
}

function AddAdminLevelForm(props: Props) {
    const {
        adminLevelOptions,
        onSave,
        value: valueFromProps,
        isPublished,
        onDelete,
    } = props;

    const [
        fileUploadOption,
        setFileUploadOption,
    ] = useState<FileUploadResponse | undefined>(valueFromProps.geoShapeFileDetails);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        setPristine,
        validate,
        setError,
    } = useForm(schema, valueFromProps);

    const error = getErrorObject(riskyError);
    const alert = useAlert();

    const {
        pending,
        trigger: addAdminLevelTrigger,
    } = useLazyRequest<AdminLevelGeoArea, PartialAdminLevel>({
        url: isDefined(valueFromProps.id)
            ? `server://admin-levels/${valueFromProps.id}/`
            : 'server://admin-levels/',
        method: isDefined(valueFromProps.id)
            ? 'PATCH'
            : 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            onSave(response);
            setPristine(true);
            alert.show(
                isDefined(valueFromProps.id)
                    ? 'Successfully updated admin level.'
                    : 'Successfully created admin level.',
                { variant: 'success' },
            );
        },
        failureMessage: isDefined(valueFromProps.id)
            ? 'Failed to  update admin level'
            : 'Failed to create admin level',
    });

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => addAdminLevelTrigger(val as PartialAdminLevel),
        );
        submit();
    }, [setError, validate, addAdminLevelTrigger]);

    const parentOptions = adminLevelOptions?.filter((v) => v.id !== valueFromProps.id);

    const handleAdminLevelDelete = useCallback(() => {
        onDelete(valueFromProps.id);
    }, [onDelete, valueFromProps.id]);

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
                <DeepFileInput
                    name="geoShapeFile"
                    className={styles.input}
                    label="Upload a file and select the corresponding field names from your file"
                    onChange={setFieldValue}
                    option={fileUploadOption}
                    setOption={setFileUploadOption}
                    value={value.geoShapeFile}
                    readOnly={isPublished}
                    disabled={pending}
                >
                    <MdFileUpload />
                </DeepFileInput>
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
