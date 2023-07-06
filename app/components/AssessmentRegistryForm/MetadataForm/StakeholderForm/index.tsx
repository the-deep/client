import React, { useCallback, useMemo, useState } from 'react';
import { listToGroupList, _cs } from '@togglecorp/fujs';
import { ContainerCard, ListView } from '@the-deep/deep-ui';
import { Error, getErrorString, SetBaseValueArg } from '@togglecorp/toggle-form';

import AddStakeholderButton from '#components/general/AddStakeholderButton';
import StakeholderList from '#views/ProjectEdit/ProjectDetailsForm/StakeholderList';
import { ProjectOrganizationTypeEnum } from '#generated/types';
import { BasicOrganization } from '#types';
import { BasicProjectOrganization, PartialFormType } from '#components/AssessmentRegistryForm/formSchema';
import { getErrorObject } from '#components/framework/AttributeInput';

import styles from './styles.css';

interface StakeholderType {
    id: ProjectOrganizationTypeEnum;
    label: string;
    formId: keyof Pick<PartialFormType, 'leadOrganizations' | 'donors' | 'nationalPartners' | 'governments' | 'internationalPartners'>;
}

const stakeholderTypes: StakeholderType[] = [
    {
        label: 'Lead Organizations',
        id: 'LEAD_ORGANIZATION',
        formId: 'leadOrganizations',
    },
    {
        label: 'International Partners',
        id: 'INTERNATIONAL_PARTNER',
        formId: 'internationalPartners',
    },
    {
        label: 'National Partners',
        id: 'NATIONAL_PARTNER',
        formId: 'nationalPartners',
    },
    {
        label: 'Donors',
        id: 'DONOR',
        formId: 'donors',
    },
    {
        label: 'Governments',
        id: 'GOVERNMENT',
        formId: 'governments',
    },
];

const stakeholderTypeKeySelector = (d: StakeholderType) => d.id;

interface Props {
    className: string;
    value: PartialFormType;
    error: Error<PartialFormType>;
    setValue: (value: SetBaseValueArg<PartialFormType>) => void;
    loading: boolean;
}

function StakeholderForm(props: Props) {
    const {
        className,
        value,
        setValue,
        loading,
        error: riskyError,
    } = props;
    const [organizations, setOrganizations] = useState<BasicProjectOrganization[] | undefined>([]);
    const [stakeholderOptions, setStakeholderOptions] = useState<BasicOrganization[]>([]);

    const error = getErrorObject(riskyError);
    const errorMap = useMemo(
        () => ({
            LEAD_ORGANIZATION: getErrorString(error?.leadOrganizations),
            DONOR: getErrorString(error?.donors),
            INTERNATIONAL_PARTNER: getErrorString(error?.internationalPartners),
            NATIONAL_PARTNER: getErrorString(error?.nationalPartners),
            GOVERNMENT: getErrorString(error?.governments),
        }),
        [error],
    );

    const organizationListRendererParams = useCallback(
        (key: ProjectOrganizationTypeEnum, v: StakeholderType) => ({
            data: stakeholderOptions.filter((org) => value[v.formId]?.includes(org.id)),
            title: v.label,
            dataPending: loading,
            error: errorMap[key],
        }),
        [loading, errorMap, value, stakeholderOptions],
    );

    const handleOrganizationChange = useCallback(
        (values: BasicProjectOrganization[] | undefined) => {
            setOrganizations(values);
            const groupedStakeholders = listToGroupList(
                (values ?? []).filter((org) => org.organizationType),
                (o) => o.organizationType,
                (o) => o.organization,
            );

            setValue({
                ...value,
                donors: groupedStakeholders.DONOR ?? undefined,
                leadOrganizations: groupedStakeholders.LEAD_ORGANIZATION ?? undefined,
                nationalPartners: groupedStakeholders.NATIONAL_PARTNER ?? undefined,
                internationalPartners: groupedStakeholders.INTERNATIONAL_PARTNER ?? undefined,
                governments: groupedStakeholders.GOVERNMENT ?? undefined,
            });
        }, [value, setValue],
    );

    return (
        <ContainerCard
            className={_cs(className, styles.stakeholders)}
            headerActions={(
                <AddStakeholderButton
                    name="organizations"
                    value={organizations}
                    onChange={handleOrganizationChange}
                    onOptionsChange={setStakeholderOptions}
                    options={stakeholderOptions}
                />
            )}
        >
            <ListView
                className={styles.organizationsContainer}
                errored={false}
                data={stakeholderTypes}
                rendererParams={organizationListRendererParams}
                renderer={StakeholderList}
                rendererClassName={styles.organizations}
                keySelector={stakeholderTypeKeySelector}
                pending={false}
                filtered={false}
            />
        </ContainerCard>
    );
}
export default StakeholderForm;
