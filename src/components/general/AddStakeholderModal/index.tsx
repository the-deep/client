import React, { useCallback } from 'react';
import {
    isDefined,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';
import {
    useForm,
    ObjectSchema,
    arrayCondition,
    StateArg,
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

type FormType = Partial<Record<OrganizationTypes, number[]>>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const stakeholdersSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        lead_organization: [arrayCondition],
        international_partner: [arrayCondition],
        national_partner: [arrayCondition],
        donor: [arrayCondition],
        government: [arrayCondition],
    }),
};

export type BasicProjectOrganization = Pick<ProjectOrganization, 'organization' | 'organizationType'>;

export interface Props<T> {
    name: T;
    onChange: (value: StateArg<BasicProjectOrganization[] | undefined>, name: string) => void;
    options: BasicOrganization[];
    onOptionsChange: (value: BasicOrganization[]) => void;
    value?: BasicProjectOrganization[];
    onModalClose: () => void;
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
    } = props;

    const groupOrganizations = useCallback(
        (organizations: BasicProjectOrganization[]) => listToGroupList(
            organizations,
            o => o.organizationType,
            o => o.organization,
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
        (stakeholders: number[], organizationType) => {
            onValueChange(() => (
                stakeholders
            ), organizationType);
        }, [onValueChange],
    );
    const handleSubmitButtonClick = () => {
        const organizations = mapToList(value, (v, key) => {
            const out = v?.map(o => ({
                organization: o,
                organizationType: key as OrganizationTypes,
            }));
            return out;
        }).filter(isDefined).flat();
        onChange(organizations, name);
        onModalClose();
    };

    return (
        <Modal
            className={styles.addStakeholderModal}
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
                    options={options}
                    onOptionsChange={onOptionsChange}
                    name="lead_organization"
                    value={value.lead_organization}
                    label={_ts('project.detail.stakeholders', 'leadOrganization')}
                />
                <StakeholderList
                    onChange={handleChange}
                    options={options}
                    onOptionsChange={onOptionsChange}
                    name="international_partner"
                    value={value.international_partner}
                    label={_ts('project.detail.stakeholders', 'internationalPartner')}
                />
                <StakeholderList
                    onChange={handleChange}
                    options={options}
                    onOptionsChange={onOptionsChange}
                    name="national_partner"
                    value={value.national_partner}
                    label={_ts('project.detail.stakeholders', 'nationalPartner')}
                />
                <StakeholderList
                    onChange={handleChange}
                    options={options}
                    onOptionsChange={onOptionsChange}
                    name="donor"
                    value={value.donor}
                    label={_ts('project.detail.stakeholders', 'donor')}
                />
                <StakeholderList
                    onChange={handleChange}
                    options={options}
                    onOptionsChange={onOptionsChange}
                    name="government"
                    value={value.government}
                    label={_ts('project.detail.stakeholders', 'government')}
                />
            </div>
        </Modal>
    );
}

export default AddStakeholderModal;
