import React, { useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    useForm,
    requiredCondition,
    urlCondition,
    ObjectSchema,
    requiredStringCondition,
} from '@togglecorp/toggle-form';
import {
    PendingMessage,
    SelectInput,
    TextInput,
    Button,
    Modal,
} from '@the-deep/deep-ui';

import _ts from '#ts';
import {
    useRequest,
    useLazyRequest,
} from '#utils/request';
import {
    MultiResponse,
    Organization,
    OrganizationType,
} from '#typings';

import styles from './styles.scss';

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
    onOrganizationAdd?: (organization: Organization) => void;
}

function AddOrganizationModal(props: Props) {
    const {
        onModalClose,
        onOrganizationAdd,
    } = props;

    const {
        pending: organizationTypesPending,
        response: organizatonTypesResponse,
    } = useRequest<MultiResponse<OrganizationType>>({
        url: 'server://organization-types/',
        method: 'GET',
        failureHeader: _ts('addOrganizationModal', 'title'),
    });
    const {
        pending: organizationPostPending,
        trigger: createOrganization,
    } = useLazyRequest<Organization, FormType>({
        url: 'server://organizations/',
        method: 'POST',
        body: ctx => ctx,
        onSuccess: (response) => {
            if (onOrganizationAdd) {
                onOrganizationAdd(response);
            }
            onModalClose();
        },
        failureHeader: _ts('addOrganizationModal', 'title'),
    });

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(defaultFormValue, organizationSchema);

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            onErrorSet(err);
            if (!errored && isDefined(val)) {
                createOrganization(val);
            }
        },
        [onErrorSet, validate, createOrganization],
    );
    const pending = organizationTypesPending || organizationPostPending;

    return (
        <Modal
            className={styles.addOrganizationModal}
            heading={_ts('addOrganizationModal', 'title')}
            onCloseButtonClick={onModalClose}
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
                className={styles.input}
                name="title"
                disabled={pending}
                onChange={onValueChange}
                value={value?.title}
                error={error?.fields?.title}
                label={_ts('addOrganizationModal', 'titleLabel')}
                placeholder={_ts('addOrganizationModal', 'titleLabel')}
                autoFocus
            />
            <TextInput
                className={styles.input}
                name="shortName"
                disabled={pending}
                onChange={onValueChange}
                value={value?.shortName}
                error={error?.fields?.shortName}
                label={_ts('addOrganizationModal', 'shortName')}
                placeholder={_ts('addOrganizationModal', 'shortName')}
            />
            <TextInput
                className={styles.input}
                name="url"
                disabled={pending}
                onChange={onValueChange}
                value={value?.url}
                error={error?.fields?.url}
                label={_ts('addOrganizationModal', 'url')}
                placeholder={_ts('addOrganizationModal', 'url')}
            />
            <SelectInput
                className={styles.input}
                name="organizationType"
                onChange={onValueChange}
                options={organizatonTypesResponse?.results}
                value={value?.organizationType}
                error={error?.fields?.organizationType}
                keySelector={organizationTypeKeySelector}
                labelSelector={organizationTypeLabelSelector}
                label={_ts('addOrganizationModal', 'organizationType')}
                placeholder={_ts('addOrganizationModal', 'organizationType')}
            />
        </Modal>
    );
}

export default AddOrganizationModal;
