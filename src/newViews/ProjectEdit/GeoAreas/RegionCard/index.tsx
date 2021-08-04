import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoTrash,
} from 'react-icons/io5';
import {
    ExpandableContainer,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';
import { useRequest } from '#utils/request';

import _ts from '#ts';
import {
    BasicRegion,
    Region,
} from '#types';

import AddAdminLevel from './AddAdminLevel';
import styles from './styles.scss';

interface Props {
    region: BasicRegion;
    className?: string;
}

function RegionCard(props: Props) {
    const {
        className,
        region,
    } = props;

    const {
        response,
    } = useRequest<Region>({
        url: `server://regions/${region.id}/`,
        method: 'GET',
        failureHeader: _ts('geoAreas', 'title'),
    });

    const handleDeleteRegionClick = () => {}; // FIXME  this will be added later

    return (
        <ExpandableContainer
            className={_cs(className, styles.region)}
            heading={region.title}
            sub
            disabled={response?.isPublished || response?.public}
            headerActions={(
                <QuickActionConfirmButton
                    name="deleteButton"
                    title={_ts('geoAreas', 'deleteGeoArea')}
                    onConfirm={handleDeleteRegionClick}
                    message={_ts('geoAreas', 'deleteGeoAreaConfirm')}
                    showConfirmationInitially={false}
                >
                    <IoTrash />
                </QuickActionConfirmButton>
            )}
        >
            {response && !response.public && (
                <AddAdminLevel
                    activeRegion={region.id}
                    adminLevels={response.adminLevels}
                    isPublished={response.isPublished}
                />
            )}
        </ExpandableContainer>
    );
}

export default RegionCard;
