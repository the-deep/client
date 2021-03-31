import React from 'react';

import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';
import _ts from '#ts';

import AddStakeholdersModal from '#components/general/AddStakeholdersModal';

export interface StakeholderType {
    id: string;
    label: string;
}
export const stakeholderTypes: StakeholderType[] = [
    {
        label: _ts('project.detail.stakeholders', 'leadOrganization'),
        id: 'lead_organization',
    },
    {
        label: _ts('project.detail.stakeholders', 'internationalPartner'),
        id: 'international_partner',
    },
    {
        label: _ts('project.detail.stakeholders', 'nationalPartner'),
        id: 'national_partner',
    },
    {
        label: _ts('project.detail.stakeholders', 'donor'),
        id: 'donor',
    },
    {
        label: _ts('project.detail.stakeholders', 'government'),
        id: 'government',
    },
];

const fields = stakeholderTypes.map(v => ({
    label: v.label,
    faramElementName: v.id,
}));

interface ButtonProps {}

function TransparentButton(props: ButtonProps) {
    return (
        <Button
            transparent
            {...props}
        />
    );
}

const ModalButton = modalize(TransparentButton);

interface Props {
    className?: string;
    disabled?: boolean;
}
function AddStakeholdersButton(props: Props) {
    const {
        className,
        disabled,
    } = props;

    return (
        <ModalButton
            className={className}
            iconName="edit"
            disabled={disabled}
            modal={
                <AddStakeholdersModal
                    faramElementName="organizations"
                    fields={fields}
                />
            }
        />
    );
}

export default AddStakeholdersButton;
