import React, { useCallback, useState, useEffect } from 'react';
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
    selectedGeoAreas?: string[] | null | undefined;
    onChange: (value: string[] | undefined) => void;
    geoAreaOptions: GeoArea[] | null | undefined;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | null | undefined>>;
    onModalClose: () => void;
}
function GeoLocationModal(props: Props) {
    const {
        className,
        projectId,
        onModalClose,
        selectedGeoAreas,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        onChange,
    } = props;

    const [
        tempGeoAreas,
        setTempGeoAreas,
    ] = useState<string[] | undefined>();

    useEffect(() => {
        setTempGeoAreas(selectedGeoAreas ?? undefined);
    }, [selectedGeoAreas]);

    const handleSubmit = useCallback(
        () => {
            onChange(tempGeoAreas);
            onModalClose();
        },
        [onChange, tempGeoAreas, onModalClose],
    );

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
                        onClick={handleSubmit}
                        variant="primary"
                    >
                        Apply
                    </Button>
                </>
            )}
        >
            <GeoLocationMapInput
                projectId={projectId}
                onChange={setTempGeoAreas}
                tempGeoAreas={tempGeoAreas}
                geoAreaOptions={geoAreaOptions}
                onGeoAreaOptionsChange={onGeoAreaOptionsChange}
            />
        </Modal>
    );
}

export default GeoLocationModal;
