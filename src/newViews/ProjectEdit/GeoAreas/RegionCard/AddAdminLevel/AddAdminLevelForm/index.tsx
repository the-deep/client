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

type FormType = Partial<AdminLevelGeoArea>;

export interface FileUploadResponse {
    id: number;
    title: string;
    file: string;
}

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
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

const defaultFormValue: PartialForm<FormType> = {};

interface Props {
    onSuccess: (id: number) => void;
    value?: Partial<AdminLevelGeoArea>;
    isPublished?: boolean;
    adminLevelOptions?: AdminLevelGeoArea[];
}

function AddAdminLevelForm(props: Props) {
    const {
        adminLevelOptions,
        onSuccess,
        value: valueFromProps,
        isPublished,
    } = props;

    const [
        fileUploadOption,
        setFileUploadOption,
    ] = useState<FileUploadResponse | undefined>(valueFromProps?.geoShapeFileDetails);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        setValue,
        validate,
        setError,
    } = useForm(schema, valueFromProps ?? defaultFormValue);

    const error = getErrorObject(riskyError);

    const {
        pending,
        trigger: addAdminLevelTrigger,
    } = useLazyRequest<AdminLevelGeoArea, FormType>({
        url: isDefined(valueFromProps?.level)
            ? `server://admin-levels/${valueFromProps?.id}/`
            : 'server://admin-levels/',
        method: isDefined(valueFromProps?.level)
            ? 'PATCH'
            : 'POST',
        body: ctx => ctx,
        onSuccess: (response) => {
            onSuccess(response.id);
            setValue(response);
        },
        failureHeader: isDefined(valueFromProps?.level)
            ? 'Failed to  update admin level'
            : 'Failed to create admin level',
    });

    const handleSubmit = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        setError(err);
        if (!errored && isDefined(val)) {
            addAdminLevelTrigger(val as FormType);
        }
    }, [setError, validate, addAdminLevelTrigger]);

    const parentOptions = adminLevelOptions?.filter(v => v.id !== valueFromProps?.id);

    return (
        <ContainerCard
            className={styles.form}
            footerActions={!isPublished && (
                <Button
                    name="submit"
                    onClick={handleSubmit}
                    disabled={pristine || pending}
                    variant="transparent"
                >
                    Save
                </Button>
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
                // error={error?.geoShapeFile}
                readOnly={isPublished}
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
                />
                <TextInput
                    name="title"
                    className={styles.input}
                    value={value.title}
                    error={error?.title}
                    onChange={setFieldValue}
                    label="Admin Level Name"
                    readOnly={isPublished}
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
                />
                <TextInput
                    name="nameProp"
                    className={styles.input}
                    value={value.nameProp}
                    error={error?.nameProp}
                    onChange={setFieldValue}
                    label="Name Property"
                    disabled={isPublished}
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
                />
            </div>
        </ContainerCard>
    );
}

export default AddAdminLevelForm;
