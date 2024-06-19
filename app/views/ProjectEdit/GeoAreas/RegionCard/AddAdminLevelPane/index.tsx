import React from 'react';
import {
    TabPanel,
} from '@the-deep/deep-ui';
import { PartialForm } from '@togglecorp/toggle-form';
import { AdminLevelInputType, AdminLevelType } from '#generated/types';

import AddAdminLevelForm from './AddAdminLevelForm';

type AdminLevel = AdminLevelInputType & { clientId: string };
type PartialAdminLevel = PartialForm<AdminLevel, 'clientId' | 'geoShapeFile'>;

interface Props {
    onSave: (adminLevel: AdminLevelType) => void;
    onDelete: (id: string | undefined) => void;
    value: PartialAdminLevel;
    isPublished?: boolean;
    adminLevelOptions?: AdminLevelType[];
    name: string;
    regionId: string;
}

function AddAdminLevelPane(props: Props) {
    const {
        onSave,
        onDelete,
        value,
        isPublished,
        adminLevelOptions,
        name,
        regionId,
    } = props;

    return (
        <TabPanel
            name={name}
        >
            <AddAdminLevelForm
                regionId={regionId}
                value={value}
                onSave={onSave}
                onDelete={onDelete}
                isPublished={isPublished}
                adminLevelOptions={adminLevelOptions}
            />
        </TabPanel>
    );
}

export default AddAdminLevelPane;
