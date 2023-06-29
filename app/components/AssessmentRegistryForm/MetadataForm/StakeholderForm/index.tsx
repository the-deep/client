import React, { useCallback, useMemo, useState } from 'react';
import { isDefined, listToGroupList, _cs } from '@togglecorp/fujs';
import { ContainerCard, ListView } from '@the-deep/deep-ui';
import { SetValueArg } from '@togglecorp/toggle-form';

import AddStakeholderButton from '#components/general/AddStakeholderButton';
import StakeholderList from '#components/StakeholderList';
import { ProjectOrganizationTypeEnum } from '#generated/types';
import _ts from '#ts';
import { BasicOrganization } from '#types';
import { BasicProjectOrganization } from '#components/AssessmentRegistryForm/useFormOptions';

import styles from './styles.css';

interface Props {
    className: string;
    loading: boolean;
    organizations?: BasicProjectOrganization[] | null;
    onChangeOrganizations: (
            value: SetValueArg<BasicProjectOrganization[] | undefined>,
            name: string | number) => void;
}

interface StakeholderType {
    id: ProjectOrganizationTypeEnum;
    label: string;
}

const stakeholderTypes: StakeholderType[] = [
    {
        label: _ts('project.detail.stakeholders', 'leadOrganization'),
        id: 'LEAD_ORGANIZATION',
    },
    {
        label: _ts('project.detail.stakeholders', 'internationalPartner'),
        id: 'INTERNATIONAL_PARTNER',
    },
    {
        label: _ts('project.detail.stakeholders', 'nationalPartner'),
        id: 'NATIONAL_PARTNER',
    },
    {
        label: _ts('project.detail.stakeholders', 'donor'),
        id: 'DONOR',
    },
    {
        label: _ts('project.detail.stakeholders', 'government'),
        id: 'GOVERNMENT',
    },
];

const stakeholderTypeKeySelector = (d: StakeholderType) => d.id;

function StakeholderForm(props: Props) {
    const {
        className,
        organizations,
        onChangeOrganizations,
        loading,
    } = props;
    const [stakeholderOptions, setStakeholderOptions] = useState<BasicOrganization[]>([]);

    const groupedStakeholders = useMemo(
        () => listToGroupList(
            (organizations ?? []).filter((org) => org.organizationType),
            (o) => o.organizationType ?? '',
            (o) => o.organization,
        ),
        [organizations],
    );

    const organizationListRendererParams = useCallback(
        (key: ProjectOrganizationTypeEnum, v: StakeholderType) => {
            const groupedOrganization = groupedStakeholders[key];
            return {
                data: groupedOrganization
                    ?.map((o) => stakeholderOptions.find((option) => option.id === o))
                    .filter(isDefined),
                title: v.label,
                dataPending: loading,
            };
        },
        [groupedStakeholders, stakeholderOptions, loading],
    );

    return (
        <ContainerCard
            className={_cs(className, styles.stakeholders)}
            headerActions={(
                <AddStakeholderButton
                    name="organizations"
                    value={organizations}
                    onChange={onChangeOrganizations}
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
