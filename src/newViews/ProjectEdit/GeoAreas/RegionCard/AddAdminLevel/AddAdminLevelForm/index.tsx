import React, { useCallback, useMemo } from 'react';
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

import notify from '#notify';
import DeepFileInput from '#newComponents/DeepFileInput';
import { useRequest, useLazyRequest } from '#utils/request';
import {
    AdminLevelGeoArea,
    MultiResponse,
} from '#typings';

import styles from './styles.scss';

type FormType = {
    title: string;
    level?: number;
    nameProp?: string;
    codeProp?: string;
    region: number;
    parent?: number;
    geoShapeFile: number;
};

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

interface Props {
    activeRegion: number;
    onSuccess: () => void;
    value?: AdminLevelGeoArea;
}

function AddAdminLevelForm(props: Props) {
    const {
        activeRegion,
        onSuccess,
        value: valueFromProps,
    } = props;

    const formValue: PartialForm<FormType> = useMemo(() => ({
        ...valueFromProps,
    }), [valueFromProps]);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, formValue);

    const error = getErrorObject(riskyError);

    const adminLevelQuery = useMemo(() => ({
        region: activeRegion,
    }), [activeRegion]);

    const {
        pending: addAdminLevelPending,
        trigger: addAdminLevelTrigger,
    } = useLazyRequest({
        url: isDefined(valueFromProps?.id)
            ? `server://admin-levels/${valueFromProps?.id}/`
            : 'server://admin-levels/',
        method: isDefined(valueFromProps?.id)
            ? 'PATCH'
            : 'POST',
        query: adminLevelQuery,
        body: ctx => ctx,
        onSuccess: () => {
            onSuccess();
            notify.send({
                title: 'Add Admin Level',
                type: notify.type.SUCCESS,
                message: 'Successfully added admin level',
                duration: notify.duration.MEDIUM,
            });
        },
        failureHeader: 'Failed to Post admin level',
    });

    const {
        response: adminLevelOptions,
    } = useRequest<MultiResponse<AdminLevelGeoArea>>({
        url: 'server://admin-levels/',
        query: adminLevelQuery,
        method: 'GET',
        failureHeader: 'Failed to fetch admin levels',
    });

    const handleSubmit = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        setError(err);
        if (!errored && isDefined(val)) {
            addAdminLevelTrigger(val as FormType);
        }
    }, [setError, validate, addAdminLevelTrigger]);


    return (
        <ContainerCard
            className={styles.form}
            footerActions={(
                <Button
                    name="submit"
                    onClick={handleSubmit}
                    disabled={pristine || addAdminLevelPending}
                    variant="transparent"
                >
                    Save
                </Button>
            )}
        >
            <DeepFileInput
                name="geoShapeFile"
                className={styles.input}
                label="Upload a file and select the corresponding field names from your file"
                onChange={setFieldValue}
                value={value.geoShapeFile}
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
                />
                <TextInput
                    name="title"
                    className={styles.input}
                    value={value.title}
                    error={error?.title}
                    onChange={setFieldValue}
                    label="Admin Level Name"
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
                />
                <TextInput
                    name="nameProp"
                    className={styles.input}
                    value={value.nameProp}
                    error={error?.nameProp}
                    onChange={setFieldValue}
                    label="Name Property"
                />
            </div>
            <div className={styles.row}>
                <SelectInput
                    name="parent"
                    className={styles.input}
                    value={value.parent}
                    error={error?.parent}
                    onChange={setFieldValue}
                    options={adminLevelOptions?.results}
                    keySelector={adminLevelKeySelector}
                    labelSelector={adminLevelLabelSelector}
                    label="Parent Name"
                />
            </div>
        </ContainerCard>
    );
}

export default AddAdminLevelForm;
