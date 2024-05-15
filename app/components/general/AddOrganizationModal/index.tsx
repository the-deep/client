import React, { useCallback } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
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
    OrganizationTypesQuery,
    OrganizationTypesQueryVariables,
    OrganizationTypeType,
    CreateOrganizationMutation,
    CreateOrganizationMutationVariables,
} from '#generated/types';

import styles from './styles.css';

type FormType = NonNullable<CreateOrganizationMutationVariables['data']>;
type PartialFormType = Partial<FormType>;
type FormSchema = ObjectSchema<PartialFormType>;
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

const organizationTypeKeySelector = (d: OrganizationTypeType): string => d.id;
const organizationTypeLabelSelector = (d: OrganizationTypeType): string => d.title;

const defaultFormValue: PartialFormType = {};

export type OrganizationItemType = NonNullable<NonNullable<CreateOrganizationMutation['organizationCreate']>['result']>;

export interface Props {
    onModalClose: () => void;
    onOrganizationAdd?: (organization: OrganizationItemType) => void;
}

const ORGANIZATION_TYPES = gql`
    query OrganizationTypes {
        organizationTypes {
            results {
                description
                id
                shortName
                title
            }
        }
    }
`;

const CREATE_ORGANIZATION = gql`
    mutation CreateOrganization (
        $data: OrganizationInputType!
    ) {
        organizationCreate (
            data: $data
        ) {
            errors
            ok
            result {
                id
                longName
                shortName
                title
                url
                verified
                organizationType {
                    id
                    title
                    shortName
                    description
                }
                logo {
                    id
                    title
                    file {
                        name
                        url
                    }
                }
            }
        }
    }
`;

function AddOrganizationModal(props: Props) {
    const {
        onModalClose,
        onOrganizationAdd,
    } = props;

    const alert = useAlert();

    const {
        data: organizationTypesResponse,
        loading: organizationTypesPending,
    } = useQuery<OrganizationTypesQuery, OrganizationTypesQueryVariables>(
        ORGANIZATION_TYPES,
    );

    const [
        createOrganization,
        { loading: createOrganizationPending },
    ] = useMutation<CreateOrganizationMutation, CreateOrganizationMutationVariables>(
        CREATE_ORGANIZATION,
        {
            onCompleted: (response) => {
                if (!response?.organizationCreate?.result) {
                    return;
                }

                if (response?.organizationCreate?.ok) {
                    alert.show(
                        'Successfully created new organization.',
                        {
                            variant: 'success',
                        },
                    );
                    onModalClose();
                    if (onOrganizationAdd) {
                        onOrganizationAdd(response?.organizationCreate?.result);
                    }
                } else {
                    alert.show(
                        'Failed to create organization.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to create organization.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

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
                (val) => createOrganization({
                    variables: {
                        data: val as FormType,
                    },
                }),
            );
            submit();
        },
        [setError, validate, createOrganization],
    );
    const pending = organizationTypesPending || createOrganizationPending;

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
                options={organizationTypesResponse?.organizationTypes?.results}
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
