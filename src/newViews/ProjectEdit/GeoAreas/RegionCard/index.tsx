import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoTrash,
} from 'react-icons/io5';
import {
    ListView,
    ExpandableContainer,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';
import { useRequest } from '#utils/request';

import _ts from '#ts';
import {
    AdminLevel,
    BasicRegion,
    Region,
} from '#typings';

import AdminLevelCard from './AdminLevelCard';
import styles from './styles.scss';

const adminLevelKeySelector = (d: AdminLevel) => d.id;

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

    const adminLevelRendererParams = useCallback((_: number, data: AdminLevel) => ({
        adminLevel: data,
    }), []);

    return (
        <ExpandableContainer
            className={_cs(className, styles.region)}
            headerClassName={styles.header}
            heading={region.title}
            sub
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
            {(response && !response.public && response.adminLevels.length > 0) && (
                <ListView
                    className={styles.adminLevels}
                    data={response?.adminLevels}
                    rendererParams={adminLevelRendererParams}
                    renderer={AdminLevelCard}
                    rendererClassName={styles.adminLevel}
                    keySelector={adminLevelKeySelector}
                />
            )}
        </ExpandableContainer>
    );
}

export default RegionCard;
