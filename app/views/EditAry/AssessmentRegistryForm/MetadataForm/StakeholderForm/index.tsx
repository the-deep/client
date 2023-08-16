import React, { useCallback, useMemo } from 'react';
import { _cs, isDefined, listToGroupList } from '@togglecorp/fujs';
import { ContainerCard, ListView } from '@the-deep/deep-ui';
import { EntriesAsList, Error, getErrorString } from '@togglecorp/toggle-form';

import AddStakeholderButton from '#components/general/AddStakeholderButton';
import StakeholderList from '#views/ProjectEdit/ProjectDetailsForm/StakeholderList';
import { ProjectOrganizationTypeEnum } from '#generated/types';
import { BasicOrganization } from '#types';
import { getErrorObject } from '#components/framework/AttributeInput';

import { PartialFormType } from '../../formSchema';

import styles from './styles.css';

interface StakeholderType {
    id: ProjectOrganizationTypeEnum;
    label: string;
}

const stakeholderTypes: StakeholderType[] = [
    {
        label: 'Lead Organizations',
        id: 'LEAD_ORGANIZATION',
    },
    {
        label: 'International Partners',
        id: 'INTERNATIONAL_PARTNER',
    },
    {
        label: 'National Partners',
        id: 'NATIONAL_PARTNER',
    },
    {
        label: 'Donors',
        id: 'DONOR',
    },
    {
        label: 'Governments',
        id: 'GOVERNMENT',
    },
];

const stakeholderTypeKeySelector = (d: StakeholderType) => d.id;

interface Props {
    className: string;
    value: PartialFormType;
    error: Error<PartialFormType>;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    loading: boolean;
    setStakeholderOptions: React.Dispatch<React.SetStateAction<BasicOrganization[]>>;
    stakeholderOptions: BasicOrganization[];
}

function StakeholderForm(props: Props) {
    const {
        className,
        value,
        setFieldValue,
        loading,
        error: riskyError,
        stakeholderOptions,
        setStakeholderOptions,
    } = props;

    const error = getErrorObject(riskyError);

    const groupedStakeholders = useMemo(
        () => listToGroupList(
            (value.stakeholders ?? []).filter((org) => org.organizationType),
            (o) => o.organizationType ?? '',
            (o) => o.organization,
        ),
        [value],
    );

    const organizationListRendererParams = useCallback(
        (key: ProjectOrganizationTypeEnum, v: StakeholderType) => {
            const organization = groupedStakeholders[key];
            return {
                data: organization
                    ?.map((o) => stakeholderOptions.find((option) => option.id === o))
                    .filter(isDefined),
                title: v.label,
                dataPending: loading,
                error: getErrorString(error?.stakeholders),
            };
        },
        [
            groupedStakeholders,
            loading,
            stakeholderOptions,
            error?.stakeholders,
        ],
    );

    return (
        <ContainerCard
            className={_cs(className, styles.stakeholders)}
            headerActions={(
                <AddStakeholderButton
                    name="stakeholders"
                    value={value.stakeholders}
                    onChange={setFieldValue}
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
