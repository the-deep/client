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
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    requiredCondition,
    useForm,
    getErrorObject,
} from '@togglecorp/toggle-form';
import NonFieldError from '#newComponents/ui/NonFieldError';
import DeepFileInput from '#newComponents/DeepFileInput';
import { useLazyRequest } from '#utils/request';
import {
    AdminLevelGeoArea,
} from '#typings';

import styles from './styles.scss';

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
        validate,
        setError,
    } = useForm(schema, valueFromProps);

    const error = getErrorObject(riskyError);

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
        body: ctx => ctx,
        onSuccess: (response) => {
            onSave(response);
        },
        failureHeader: isDefined(valueFromProps.id)
            ? 'Failed to  update admin level'
            : 'Failed to create admin level',
    });

    const handleDelete = useCallback(() => {
        // NOTE: if no id is defined, just remove the temporary form
        onDelete(valueFromProps.id);
    }, [onDelete, valueFromProps.id]);

    const handleSubmit = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        setError(err);
        if (!errored && isDefined(val)) {
            addAdminLevelTrigger(val as PartialAdminLevel);
        }
    }, [setError, validate, addAdminLevelTrigger]);

    const parentOptions = adminLevelOptions?.filter(v => v.id !== valueFromProps.id);

    return (
        <ContainerCard
            className={styles.form}
            footerActions={(
                <>
                    <Button
                        name="delete"
                        onClick={handleDelete}
                        disabled={pending}
                        variant="transparent"
                    >
                        {value.id ? 'Delete' : 'Cancel'}
                    </Button>
                    {!isPublished && (
                        <Button
                            name="submit"
                            onClick={handleSubmit}
                            disabled={pristine || pending}
                            variant="transparent"
                        >
                            Save
                        </Button>
                    )}
                </>
            )}
        >
            <NonFieldError error={error} />
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
