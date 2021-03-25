import React, { useCallback } from 'react';

import { useModalState } from '#hooks/stateManagement';
import Icon from '#rscg/Icon';
import Button from '#dui/Button';
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

interface Props {
    className?: string;
    disabled?: boolean;
}
function AddStakeholdersButton(props: Props) {
    const {
        className,
        disabled,
    } = props;

    const [
        showModal,
        setModalVisible,
        setModalHidden,
    ] = useModalState(false);

    const handleShowStakeholdersModal = useCallback(() => {
        if (showModal) {
            setModalHidden();
        } else {
            setModalVisible();
        }
    }, [setModalHidden, setModalVisible, showModal]);

    return (
        <>
            <Button
                className={className}
                variant="tertiary"
                onClick={handleShowStakeholdersModal}
                disabled={disabled}
                icons={<Icon name="edit" />}
            />
            {showModal && (
                <AddStakeholdersModal
                    closeModal={setModalHidden}
                    faramElementName="organizations"
                    fields={fields}
                />
            )}
        </>
    );
}

export default AddStakeholdersButton;
