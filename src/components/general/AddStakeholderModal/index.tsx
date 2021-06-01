import React, { useCallback } from 'react';
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
import { BasicOrganization } from '#typings';

import SearchStakeholder from './SearchStakeholder';
import StakeholderList from './StakeholderList';

import styles from './styles.scss';

export type FormType = {
    lead_organization?: BasicOrganization[];
    international_partner?: BasicOrganization[];
    national_partner?: BasicOrganization[];
    donor?: BasicOrganization[];
    government?: BasicOrganization[];
}
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

interface Props {
    onChange: (value: FormType) => void;
    value?: FormType;
    onModalClose: () => void;
}
const defaultFormValues: FormType = {};
function AddStakeholderModal(props: Props) {
    const {
        value: valueFromProps,
        onChange,
        onModalClose,
    } = props;

    console.warn('value', valueFromProps, onChange);
    const handleSubmitButtonClick = () => {};

    const {
        pristine,
        value,
        onValueChange,
    } = useForm(defaultFormValues, stakeholdersSchema);

    const handleChange = useCallback(
        (stakeholders: BasicOrganization[], name) => {
            onValueChange(() => (
                stakeholders
            ), name);
        }, [onValueChange],
    );

    return (
        <Modal
            className={styles.modal}
            heading={
                <Heading
                    className={styles.heading}
                >
                    Add Stakeholder
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
                    Save
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
