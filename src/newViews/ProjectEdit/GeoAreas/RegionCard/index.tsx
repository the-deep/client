import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoTrash } from 'react-icons/io5';
import {
    QuickActionConfirmButton,
    ElementFragments,
} from '@the-deep/deep-ui';

import _ts from '#ts';
import { BasicRegion } from '#typings';

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

    const handleDeleteRegionClick = () => {}; // FIXME  this will be added later

    return (
        <div className={_cs(className, styles.region)}>
            <ElementFragments
                childrenContainerClassName={styles.title}
                actionsContainerClassName={styles.button}
                actions={(
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
                {region.title}
            </ElementFragments>
        </div>
    );
}

export default RegionCard;
