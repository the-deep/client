import React, { useCallback } from 'react';
import {
    isDefined,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';
import {
    useForm,
    ObjectSchema,
    requiredCondition,
    ArraySchema,
} from '@togglecorp/toggle-form';
import {
    Heading,
    Button,
    Modal,
} from '@the-deep/deep-ui';
import _ts from '#ts';
import {
    BasicOrganization,
    ProjectOrganization,
    OrganizationTypes,
} from '#typings';

import SearchStakeholder from './SearchStakeholder';
import StakeholderList from './StakeholderList';

import styles from './styles.scss';

export type FormType = Partial<Record<OrganizationTypes, BasicOrganization[]>>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type StakeholderSchema = ObjectSchema<BasicOrganization>;
type StakeholderSchemaFields = ReturnType<StakeholderSchema['fields']>;
const stakeholderSchema: StakeholderSchema = {
    fields: (): StakeholderSchemaFields => ({
        id: [requiredCondition],
        title: [requiredCondition],
    }),
};

type StakeholderListSchema = ArraySchema<BasicOrganization>;
type StakeholderListMember = ReturnType<StakeholderListSchema['member']>;

const stakeholderListSchema: StakeholderListSchema = {
    keySelector: d => d.id,
    member: (): StakeholderListMember => stakeholderSchema,
};

const stakeholdersSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        lead_organization: stakeholderListSchema,
        international_partner: stakeholderListSchema,
        national_partner: stakeholderListSchema,
        donor: stakeholderListSchema,
        government: stakeholderListSchema,
    }),
};

export interface StakeholderOptionType {
    label: string;
    name: string;
}

export type BasicProjectOrganization = Omit<ProjectOrganization, 'id' | 'organizationTypeDisplay'>;

export interface Props<T> {
    name: T;
    onChange: (value: BasicProjectOrganization[], name: T) => void;
    value?: BasicProjectOrganization[];
    onModalClose: () => void;
}

const defaultFormValues: FormType = {};

function AddStakeholderModal<T extends string>(props: Props<T>) {
    const {
        name,
        value: initialValue,
        onChange,
        onModalClose,
    } = props;

    const groupOrganizations = useCallback(
        (organizations: BasicProjectOrganization[]) => listToGroupList(
            organizations,
            o => o.organizationType,
            o => ({ id: o.organization, title: o.organizationDetails.title }),
        ),
        [],
    );

    const [initialFormValue] = React.useState<FormType>(
        isDefined(initialValue) ? groupOrganizations(initialValue) : defaultFormValues,
    );

    const {
        pristine,
        value,
        onValueChange,
    } = useForm(initialFormValue, stakeholdersSchema);

    const handleChange = useCallback(
        (stakeholders: BasicOrganization[], organizationType) => {
            onValueChange(() => (
                stakeholders
            ), organizationType);
        }, [onValueChange],
    );
    const handleSubmitButtonClick = () => {
        const organizations = mapToList(value, (v, key) => {
            const out = v?.map(o => ({
                organization: o.id,
                organizationDetails: {
                    ...o,
                    logo: o.logoUrl,
                },
                organizationType: key as OrganizationTypes,
            }));
            return out;
        }).filter(isDefined).flat();
        onChange(organizations, name);
        onModalClose();
    };

    return (
        <Modal
            className={styles.modal}
            heading={
                <Heading
                    className={styles.heading}
                >
                    {initialValue?.length === 0 ?
                        _ts('project.detail.stakeholders', 'addStakeholder')
                        : _ts('project.detail.stakeholders', 'editStakeholder')
                    }
                </Heading>
            }
            onCloseButtonClick={onModalClose}
            bodyClassName={styles.modalBody}
            footerClassName={styles.footer}
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
                    name="lead_organization"
                    value={value.lead_organization}
                    label={_ts('project.detail.stakeholders', 'leadOrganization')}
                />
                <StakeholderList
                    onChange={handleChange}
                    name="international_partner"
                    value={value.international_partner}
                    label={_ts('project.detail.stakeholders', 'internationalPartner')}
                />
                <StakeholderList
                    onChange={handleChange}
                    name="national_partner"
                    value={value.national_partner}
                    label={_ts('project.detail.stakeholders', 'nationalPartner')}
                />
                <StakeholderList
                    onChange={handleChange}
                    name="donor"
                    value={value.donor}
                    label={_ts('project.detail.stakeholders', 'donor')}
                />
                <StakeholderList
                    onChange={handleChange}
                    name="government"
                    value={value.government}
                    label={_ts('project.detail.stakeholders', 'government')}
                />
            </div>
        </Modal>
    );
}

export default AddStakeholderModal;
