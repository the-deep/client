import React, { useCallback, useState, useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    ObjectSchema,
    requiredStringCondition,
    useForm,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    Button,
    TextArea,
    PendingMessage,
    TextInput,
    DateInput,
    Container,
    Tag,
} from '@the-deep/deep-ui';
import { useLazyRequest } from '#utils/request';
import _ts from '#ts';
import { AnalyticalFramework, BasicOrganization } from '#typings';
import OrganizationSelectInput from '#newComponents/input/OrganizationSelectInput';

import UploadImage from './UploadImage';
import styles from './styles.scss';


type PartialFormType = {
    title?: string;
    organization?: number;
    description?: string;
    previewImage?: File;
};
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const defaultFormValues: PartialFormType = {};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredStringCondition],
        description: [],
        organization: [],
        previewImage: [],
    }),
};

interface Props {
    frameworkId: number;
    className?: string;
    analyticalFramework?: AnalyticalFramework;
    frameworkGetPending: boolean;
    onSuccess: (value: AnalyticalFramework) => void;
}
function FrameworkDetailsForm(props: Props) {
    const {
        frameworkId,
        className,
        analyticalFramework: analyticalFrameworkFromProps,
        frameworkGetPending,
        onSuccess,
    } = props;

    const [
        organizationOptions,
        setOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const initialValue = useMemo(
        (): PartialFormType => {
            if (!analyticalFrameworkFromProps) {
                return defaultFormValues;
            }
            const { title, organization, description } = analyticalFrameworkFromProps;
            return { title, organization, description };
        },
        [analyticalFrameworkFromProps],
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

    const error = getErrorObject(riskyError);

    const {
        pending: frameworkPatchPending,
        trigger: patchFramework,
    } = useLazyRequest<AnalyticalFramework, PartialFormType>({
        url: `server://analysis-frameworks/${frameworkId}/`,
        formData: true,
        method: 'PATCH',
        body: ctx => ctx,
        onSuccess: (response) => {
            const { title, organization, description } = response;
            setValue({ title, organization, description });
            onSuccess(response);
        },
        failureHeader: _ts('analyticalFramework', 'title'),
    });

    const handleSubmit = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        setError(err);
        if (!errored && isDefined(val)) {
            patchFramework(val);
        }
    }, [setError, validate, patchFramework]);

    const projectOrganizations = useMemo(() => (analyticalFrameworkFromProps?.organizationDetails ?
        [analyticalFrameworkFromProps.organizationDetails] : []
    ), [analyticalFrameworkFromProps?.organizationDetails]);

    const pending = frameworkPatchPending || frameworkGetPending;

    return (
        <Container
            className={_cs(className, styles.frameworkDetailsForm)}
            footerContent
            footerClassName={styles.footer}
            footerActions={
                <Button
                    name={undefined}
                    variant="primary"
                    disabled={pristine || pending}
                    onClick={handleSubmit}
                >
                    {_ts('analyticalFramework', 'saveFramework')}
                </Button>
            }
            contentClassName={styles.mainContent}
        >
            {pending && <PendingMessage />}
            <div className={styles.content}>
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
                            value={analyticalFrameworkFromProps?.createdByName}
                            readOnly
                            label={_ts('analyticalFramework', 'createdBy')}
                        />
                        <DateInput
                            className={styles.createdOn}
                            name="createdAt"
                            value={analyticalFrameworkFromProps?.createdAt?.split('T')[0]}
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
                            variant={analyticalFrameworkFromProps?.isPrivate ? 'default' : 'complement1'}
                        >
                            {_ts('analyticalFramework', 'publicFramework')}
                        </Tag>
                        <Tag variant={analyticalFrameworkFromProps?.isPrivate ? 'complement1' : 'default'}>
                            {_ts('analyticalFramework', 'privateFramework')}
                        </Tag>
                    </Container>
                </div>
                <UploadImage
                    className={styles.imagePreview}
                    alt={_ts('analyticalFramework', 'previewImage')}
                    name="previewImage"
                    value={value.previewImage}
                    image={analyticalFrameworkFromProps?.previewImage}
                    onChange={setFieldValue}
                />
            </div>
        </Container>
    );
}

export default FrameworkDetailsForm;
