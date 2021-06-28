import React, { useCallback, useState, useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    ObjectSchema,
    PartialForm,
    requiredCondition,
    useForm,
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
import OrganizationSelectInput from '#components/input/OrganizationSelectInput';

import UploadImage from './UploadImage';
import styles from './styles.scss';

interface Props {
    frameworkId: number;
    className?: string;
    analyticalFramework?: AnalyticalFramework;
    frameworkGetPending: boolean;
}


type FormType = Pick<AnalyticalFramework, 'title' | 'organization' | 'description' | 'isPrivate' | 'createdByName' | 'createdAt'> & {
    previewImage: File | string | null | undefined;
}
type PartialFormType = PartialForm<FormType>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const defaultFormValues: PartialFormType = {};
const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredCondition],
        description: [],
        organization: [],
        previewImage: [],
    }),
};

function FrameworkDetailsForm(props: Props) {
    const {
        frameworkId,
        className,
        analyticalFramework: analyticalFrameworkFromProps,
        frameworkGetPending,
    } = props;

    const [
        organizationOptions,
        setOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onValueSet,
        onErrorSet,
    } = useForm(analyticalFrameworkFromProps ?? defaultFormValues, schema);

    const {
        pending: frameworkPatchPending,
        trigger: patchFramework,
    } = useLazyRequest<AnalyticalFramework, PartialFormType>({
        url: `server://analysis-frameworks/${frameworkId}/`,
        formData: true,
        method: 'PATCH',
        body: ctx => ctx,
        onSuccess: (response) => {
            onValueSet(response);
        },
        failureHeader: _ts('analyticalFramework', 'title'),
    });

    const handleSubmit = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        onErrorSet(err);
        if (!errored && isDefined(val)) {
            patchFramework(val);
        }
    }, [onErrorSet, validate, patchFramework]);

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
                        onChange={onValueChange}
                        value={value.title}
                        error={error?.fields?.title}
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
                            value={value.createdByName}
                            error={error?.fields?.createdByName}
                            readOnly
                            label={_ts('analyticalFramework', 'createdBy')}
                        />
                        <DateInput
                            className={styles.createdOn}
                            name="createdAt"
                            value={value.createdAt?.split('T')[0]}
                            readOnly
                            label={_ts('analyticalFramework', 'createdOn')}
                        />
                    </div>
                    <OrganizationSelectInput
                        className={styles.input}
                        name="organization"
                        value={value.organization}
                        onChange={onValueChange}
                        options={organizationOptions ?? projectOrganizations}
                        onOptionsChange={setOrganizationOptions}
                        error={error?.fields?.organization}
                        disabled={pending}
                        label={_ts('analyticalFramework', 'associatedOrganization')}
                        placeholder={_ts('analyticalFramework', 'associatedOrganization')}
                    />
                    <TextArea
                        className={styles.input}
                        name="description"
                        value={value.description}
                        onChange={onValueChange}
                        error={error?.fields?.description}
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
                            variant={value.isPrivate ? 'default' : 'complement1'}
                        >
                            {_ts('analyticalFramework', 'publicFramework')}
                        </Tag>
                        <Tag variant={value.isPrivate ? 'complement1' : 'default'}>
                            {_ts('analyticalFramework', 'privateFramework')}
                        </Tag>
                    </Container>
                </div>
                <UploadImage
                    className={styles.imagePreview}
                    alt={_ts('analyticalFramework', 'previewImage')}
                    name="previewImage"
                    value={value.previewImage}
                    onChange={onValueChange}
                />
            </div>
        </Container>
    );
}

export default FrameworkDetailsForm;
