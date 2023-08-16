import React, { useCallback } from 'react';
import {
    isDefined,
    listToGroupList,
    mapToList,
    randomString,
} from '@togglecorp/fujs';
import {
    useForm,
    ObjectSchema,
    defaultEmptyArrayType,
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

type FormType = Partial<Record<ProjectOrganizationTypeEnum, string[]>>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const stakeholdersSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        LEAD_ORGANIZATION: [defaultEmptyArrayType],
        INTERNATIONAL_PARTNER: [defaultEmptyArrayType],
        NATIONAL_PARTNER: [defaultEmptyArrayType],
        DONOR: [defaultEmptyArrayType],
        GOVERNMENT: [defaultEmptyArrayType],
    }),
};

export type BasicProjectOrganization = PurgeNull<ProjectOrganizationGqInputType>
    & { clientId: string };

export interface Props<T> {
    name: T;
    onChange: (value: BasicProjectOrganization[] | undefined, name: T) => void;
    options: BasicOrganization[];
    onOptionsChange: (value: BasicOrganization[]) => void;
    value?: BasicProjectOrganization[] | null;
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
            (o) => o.organizationType,
            (o) => o.organization,
        ),
        [],
    );

    const [initialFormValue] = React.useState<FormType>(
        isDefined(initialValue) ? groupOrganizations(initialValue) : defaultFormValues,
    );

    const {
        pristine,
        value,
        setFieldValue,
    } = useForm(stakeholdersSchema, initialFormValue);

    const handleChange = useCallback(
        (stakeholders: string[], organizationType: ProjectOrganizationTypeEnum) => {
            setFieldValue(stakeholders, organizationType);
        }, [setFieldValue],
    );
    const handleSubmitButtonClick = () => {
        const organizations = mapToList(value, (v, key) => {
            const out = v?.map((o) => ({
                organization: o,
                clientId: randomString(),
                organizationType: key as ProjectOrganizationTypeEnum,
            }));
            return out;
        }).filter(isDefined).flat();
        onChange(organizations, name);
        onModalClose();
    };

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
                    label={_ts('project.detail.stakeholders', 'leadOrganization')}
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
