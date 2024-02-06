import React, { useCallback } from 'react';
import {
    isDefined,
    listToGroupList,
} from '@togglecorp/fujs';
import {
    PartialForm,
    defaultUndefinedType,
    requiredCondition,
    useForm,
    ObjectSchema,
    ArraySchema,
    createSubmitHandler,
    PurgeNull,
} from '@togglecorp/toggle-form';
import {
    Button,
    Modal,
} from '@the-deep/deep-ui';
import _ts from '#ts';
import {
    BasicOrganization,
} from '#types';
import {
    ProjectOrganizationGqInputType,
    ProjectOrganizationTypeEnum,
} from '#generated/types';

import SearchStakeholder from './SearchStakeholder';
import StakeholderList from './StakeholderList';

import styles from './styles.css';

export type BasicProjectOrganization = PartialForm<PurgeNull<ProjectOrganizationGqInputType>>
    & { clientId: string };

type FormType = PartialForm<Record<ProjectOrganizationTypeEnum, BasicProjectOrganization[]>, 'clientId'>;

type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

export type PartialOrg = NonNullable<FormType['LEAD_ORGANIZATION']>[number];

type OrgSchema = ObjectSchema<PartialOrg, FormType>;
type OrgSchemaFields = ReturnType<OrgSchema['fields']>;

type OrgFormSchema = ArraySchema<PartialOrg, FormType>;
type OrgFormSchemaMember = ReturnType<OrgFormSchema['member']>;

const stakeholdersSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        LEAD_ORGANIZATION: {
            keySelector: (org) => org.clientId,
            member: (): OrgFormSchemaMember => ({
                fields: (): OrgSchemaFields => ({
                    clientId: [requiredCondition],
                    id: [defaultUndefinedType],
                    organization: [requiredCondition],
                    organizationType: [requiredCondition],
                }),
            }),
        },
        INTERNATIONAL_PARTNER: {
            keySelector: (org) => org.clientId,
            member: (): OrgFormSchemaMember => ({
                fields: (): OrgSchemaFields => ({
                    clientId: [requiredCondition],
                    id: [defaultUndefinedType],
                    organization: [requiredCondition],
                    organizationType: [requiredCondition],
                }),
            }),
        },
        NATIONAL_PARTNER: {
            keySelector: (org) => org.clientId,
            member: (): OrgFormSchemaMember => ({
                fields: (): OrgSchemaFields => ({
                    clientId: [requiredCondition],
                    id: [defaultUndefinedType],
                    organization: [requiredCondition],
                    organizationType: [requiredCondition],
                }),
            }),
        },
        DONOR: {
            keySelector: (org) => org.clientId,
            member: (): OrgFormSchemaMember => ({
                fields: (): OrgSchemaFields => ({
                    clientId: [requiredCondition],
                    id: [defaultUndefinedType],
                    organization: [requiredCondition],
                    organizationType: [requiredCondition],
                }),
            }),
        },
        GOVERNMENT: {
            keySelector: (org) => org.clientId,
            member: (): OrgFormSchemaMember => ({
                fields: (): OrgSchemaFields => ({
                    clientId: [requiredCondition],
                    id: [defaultUndefinedType],
                    organization: [requiredCondition],
                    organizationType: [requiredCondition],
                }),
            }),
        },
    }),
};

export interface Props<T> {
    name: T;
    onChange: (value: BasicProjectOrganization[] | undefined, name: T) => void;
    options: BasicOrganization[];
    onOptionsChange: (value: BasicOrganization[]) => void;
    value?: BasicProjectOrganization[] | null;
    onModalClose: () => void;
    fromAssessment?: boolean;
}

const defaultFormValues: FormType = {};

function AddStakeholderModal<T extends string>(props: Props<T>) {
    const {
        name,
        value: initialValue,
        onChange,
        options,
        onOptionsChange,
        onModalClose,
        fromAssessment,
    } = props;

    const groupOrganizations = useCallback(
        (organizations: BasicProjectOrganization[]) => listToGroupList(
            organizations,
            (o) => o.organizationType ?? '??',
            (o) => o,
        ),
        [],
    );

    const [initialFormValue] = React.useState<FormType>(
        isDefined(initialValue) ? groupOrganizations(initialValue) : defaultFormValues,
    );

    const {
        pristine,
        value,
        setError,
        validate,
        setFieldValue,
    } = useForm(stakeholdersSchema, initialFormValue);

    const handleChange = useCallback(
        (
            stakeholders: PartialForm<BasicProjectOrganization[], 'clientId'>,
            organizationType: ProjectOrganizationTypeEnum,
        ) => {
            setFieldValue(stakeholders, organizationType);
        }, [setFieldValue],
    );
    const handleSubmitButtonClick = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => {
                    const orgs = Object.values(val).flat() as BasicProjectOrganization[];
                    onChange(orgs, name);
                    onModalClose();
                },
            );
            submit();
        },
        [
            validate,
            setError,
            name,
            onChange,
            onModalClose,
        ],
    );

    return (
        <Modal
            className={styles.addStakeholderModal}
            size="cover"
            heading={
                initialValue?.length === 0
                    ? _ts('project.detail.stakeholders', 'addStakeholder')
                    : _ts('project.detail.stakeholders', 'editStakeholder')
            }
            onCloseButtonClick={onModalClose}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name={undefined}
                    variant="primary"
                    disabled={pristine}
                    onClick={handleSubmitButtonClick}
                >
                    {_ts('project.detail.stakeholders', 'save')}
                </Button>
            )}
        >
            <SearchStakeholder className={styles.left} />
            <div className={styles.right}>
                <StakeholderList
                    onChange={handleChange}
                    options={options}
                    onOptionsChange={onOptionsChange}
                    name="LEAD_ORGANIZATION"
                    value={value.LEAD_ORGANIZATION}
                    label={fromAssessment
                        ? 'Assessment Lead'
                        : _ts('project.detail.stakeholders', 'leadOrganization')}
                />
                <StakeholderList
                    onChange={handleChange}
                    options={options}
                    onOptionsChange={onOptionsChange}
                    name="INTERNATIONAL_PARTNER"
                    value={value.INTERNATIONAL_PARTNER}
                    label={_ts('project.detail.stakeholders', 'internationalPartner')}
                />
                <StakeholderList
                    onChange={handleChange}
                    options={options}
                    onOptionsChange={onOptionsChange}
                    name="NATIONAL_PARTNER"
                    value={value.NATIONAL_PARTNER}
                    label={_ts('project.detail.stakeholders', 'nationalPartner')}
                />
                <StakeholderList
                    onChange={handleChange}
                    options={options}
                    onOptionsChange={onOptionsChange}
                    name="DONOR"
                    value={value.DONOR}
                    label={_ts('project.detail.stakeholders', 'donor')}
                />
                <StakeholderList
                    onChange={handleChange}
                    options={options}
                    onOptionsChange={onOptionsChange}
                    name="GOVERNMENT"
                    value={value.GOVERNMENT}
                    label={_ts('project.detail.stakeholders', 'government')}
                />
            </div>
        </Modal>
    );
}

export default AddStakeholderModal;
