import React from 'react';
import {
    TabPanel,
} from '@the-deep/deep-ui';
import { PartialForm } from '@togglecorp/toggle-form';

import {
    AdminLevelGeoArea,
} from '#typings';

import AddAdminLevelForm from './AddAdminLevelForm';

type AdminLevel = AdminLevelGeoArea & { clientId: string };
type PartialAdminLevel = PartialForm<AdminLevel, 'clientId' | 'geoShapeFileDetails'>;

interface Props {
    onSave: (adminLevel: AdminLevelGeoArea) => void;
    onDelete: (id: number | undefined) => void;
    value: PartialAdminLevel;
    isPublished?: boolean;
    adminLevelOptions?: AdminLevelGeoArea[];
    name: string;
}

function AddAdminLevelPane(props: Props) {
    const {
        onSave,
        onDelete,
        value,
        isPublished,
        adminLevelOptions,
        name,
    } = props;

    return (
        <TabPanel
            name={name}
        >
            <AddAdminLevelForm
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
