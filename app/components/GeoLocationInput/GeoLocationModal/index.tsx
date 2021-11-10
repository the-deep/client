import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Modal,
    Button,
} from '@the-deep/deep-ui';
import GeoLocationMapInput from './GeoLocationMapInput';
import { GeoArea } from '#components/GeoMultiSelectInput';

import styles from './styles.css';

interface Props {
    className?: string;
    projectId: string;
    onSubmit: () => void;
    tempGeoAreas?: string[] | null | undefined;
    geoAreaOptions: GeoArea[] | null | undefined;
    onTempGeoAreasChange: React.Dispatch<React.SetStateAction<string[] | null | undefined>>;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | null | undefined>>;
    onModalClose: () => void;
}
function GeoLocationModal(props: Props) {
    const {
        className,
        projectId,
        onModalClose,
        tempGeoAreas,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        onTempGeoAreasChange,
        onSubmit,
    } = props;

    return (
        <Modal
            heading="Select Geo Areas"
            className={_cs(className, styles.geoLocationModal)}
            onCloseButtonClick={onModalClose}
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        onClick={onModalClose}
                        variant="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        name={undefined}
                        disabled={!tempGeoAreas}
                        onClick={onSubmit}
                        variant="primary"
                    >
                        Apply
                    </Button>
                </>
            )}
        >
            <GeoLocationMapInput
                projectId={projectId}
                onChange={onTempGeoAreasChange}
                tempGeoAreas={tempGeoAreas}
                geoAreaOptions={geoAreaOptions}
                onGeoAreaOptionsChange={onGeoAreaOptionsChange}
            />
        </Modal>
    );
}

export default GeoLocationModal;
