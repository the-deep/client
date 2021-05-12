import React, { useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    ObjectSchema,
    PartialForm,
    requiredCondition,
    useForm,
} from '@togglecorp/toggle-form';
import {
    Button,
    SelectInput,
    TextArea,
    PendingMessage,
    TextInput,
    DateInput,
    Container,
    Tag,
} from '@the-deep/deep-ui';
import { notifyOnFailure } from '#utils/requestNotify';
import { useLazyRequest } from '#utils/request';
import _ts from '#ts';
import { AnalyticalFramework, OrganizationDetails } from '#typings';

import styles from './styles.scss';

interface Props {
    frameworkId: number;
    analyticalFramework?: AnalyticalFramework;
    frameworkGetPending: boolean;
}

type FormType = Pick<AnalyticalFramework, 'title' | 'organization' | 'description' | 'isPrivate' | 'createdByName' | 'createdAt'>
type PartialFormType = PartialForm<FormType>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const defaultFormValues: PartialFormType = {};
const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredCondition],
        description: [],
    }),
};
const organizationKeySelector = (o: OrganizationDetails) => o.id;
const organizationLabelSelector = (o: OrganizationDetails) => o.title;

function FrameworkDetailsForm(props: Props) {
    const {
        frameworkId,
        analyticalFramework: analyticalFrameworkFromProps,
        frameworkGetPending,
    } = props;

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
        method: 'PATCH',
        body: ctx => ctx,
        onSuccess: (response) => {
            onValueSet(response);
        },
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('analyticalFramework', 'title'))({ error: errorBody }),
    });

    const handleSubmit = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        onErrorSet(err);
        if (!errored && isDefined(val)) {
            patchFramework(val);
        }
    }, [onErrorSet, validate, patchFramework]);

    const pending = frameworkPatchPending || frameworkGetPending;

    return (
        <div className={styles.frameworkDetailsForm}>
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
                    <SelectInput
                        className={styles.input}
                        name="organization"
                        options={[]} // TODO: will add organization selection later
                        readOnly
                        keySelector={organizationKeySelector}
                        labelSelector={organizationLabelSelector}
                        onChange={onValueChange}
                        value={value.organization}
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
                <div className={styles.imagePreview}>
                    Image Preview
                </div>
            </div>
            <div className={styles.footer}>
                <Button
                    name={undefined}
                    variant="primary"
                    disabled={pristine || pending}
                    onClick={handleSubmit}
                >
                    {_ts('analyticalFramework', 'saveFramework')}
                </Button>
            </div>
        </div>
    );
}

export default FrameworkDetailsForm;
