import React, { useCallback } from 'react';
import {
    useForm,
    requiredCondition,
    urlCondition,
    ObjectSchema,
    requiredStringCondition,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    PendingMessage,
    SelectInput,
    TextInput,
    Button,
    Modal,
    useAlert,
} from '@the-deep/deep-ui';

import _ts from '#ts';
import {
    useRequest,
    useLazyRequest,
} from '#base/utils/restRequest';
import {
    MultiResponse,
    Organization,
    OrganizationType,
} from '#types';
import { OrganizationItemType } from '#components/general/AddStakeholderModal/SearchStakeholder/Stakeholder';

import styles from './styles.css';

type FormType = Partial<Pick<Organization, 'title' | 'shortName' | 'url' | 'organizationType' | 'logo'>>
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
const organizationSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredStringCondition],
        shortName: [requiredStringCondition],
        url: [urlCondition],
        organizationType: [requiredCondition],
        logo: [], // FIXME use DeepImageInput when available
    }),
};

const organizationTypeKeySelector = (d: OrganizationType): number => d.id;
const organizationTypeLabelSelector = (d: OrganizationType): string => d.title;

const defaultFormValue: FormType = {};

export interface Props {
    onModalClose: () => void;
    onOrganizationAdd?: (organization: OrganizationItemType) => void;
}

function AddOrganizationModal(props: Props) {
    const {
        onModalClose,
        onOrganizationAdd,
    } = props;

    const alert = useAlert();

    const {
        pending: organizationTypesPending,
        response: organizationTypesResponse,
    } = useRequest<MultiResponse<OrganizationType>>({
        url: 'server://organization-types/',
        method: 'GET',
    });

    const {
        pending: organizationPostPending,
        trigger: createOrganization,
    } = useLazyRequest<OrganizationItemType, FormType>({
        url: 'server://organizations/',
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (onOrganizationAdd) {
                onOrganizationAdd({
                    ...response,
                    id: response.id,
                });
            }
            alert.show(
                'Successfully created new organization.',
                {
                    variant: 'success',
                },
            );
            onModalClose();
        },
        failureMessage: 'Failed to create organization.',
    });

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(organizationSchema, defaultFormValue);

    const error = getErrorObject(riskyError);

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                createOrganization,
            );
            submit();
        },
        [setError, validate, createOrganization],
    );
    const pending = organizationTypesPending || organizationPostPending;

    return (
        <Modal
            className={styles.addOrganizationModal}
            heading={_ts('addOrganizationModal', 'title')}
            onCloseButtonClick={onModalClose}
            freeHeight
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name="submit"
                    type="submit"
                    variant="primary"
                    disabled={pristine || pending}
                    onClick={handleSubmit}
                >
                    {_ts('addOrganizationModal', 'save')}
                </Button>
            )}
        >
            {pending && <PendingMessage />}
            <TextInput
                name="title"
                disabled={pending}
                onChange={setFieldValue}
                value={value?.title}
                error={error?.title}
                label={_ts('addOrganizationModal', 'titleLabel')}
                placeholder={_ts('addOrganizationModal', 'titleLabel')}
                autoFocus
            />
            <TextInput
                name="shortName"
                disabled={pending}
                onChange={setFieldValue}
                value={value?.shortName}
                error={error?.shortName}
                label={_ts('addOrganizationModal', 'shortName')}
                placeholder={_ts('addOrganizationModal', 'shortName')}
            />
            <TextInput
                name="url"
                disabled={pending}
                onChange={setFieldValue}
                value={value?.url}
                error={error?.url}
                label={_ts('addOrganizationModal', 'url')}
                placeholder={_ts('addOrganizationModal', 'url')}
            />
            <SelectInput
                name="organizationType"
                onChange={setFieldValue}
                options={organizationTypesResponse?.results}
                value={value?.organizationType}
                error={error?.organizationType}
                keySelector={organizationTypeKeySelector}
                labelSelector={organizationTypeLabelSelector}
                label={_ts('addOrganizationModal', 'organizationType')}
                placeholder={_ts('addOrganizationModal', 'organizationType')}
            />
        </Modal>
    );
}
export default AddOrganizationModal;
