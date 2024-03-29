import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Modal,
    Button,
} from '@the-deep/deep-ui';
import { GeoArea } from '#components/GeoMultiSelectInput';
import GeoLocationMapInput from './GeoLocationMapInput';

import styles from './styles.css';

interface Props {
    className?: string;
    projectId: string;
    onSubmit: (newVal: string[] | undefined) => void;
    initialValue: string[] | null | undefined;
    geoAreaOptions: GeoArea[] | null | undefined;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | null | undefined>>;
    onModalClose: () => void;

    rightComponent?: React.ReactNode;
}
function GeoLocationModal(props: Props) {
    const {
        className,
        projectId,
        onModalClose,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        initialValue,
        onSubmit,

        rightComponent,
    } = props;

    const [
        tempGeoAreas,
        setTempGeoAreas,
    ] = useState<string[] | null | undefined>(initialValue);

    const handleSubmit = useCallback(() => {
        onSubmit(tempGeoAreas ?? undefined);
    }, [onSubmit, tempGeoAreas]);

    return (
        <Modal
            heading="Select Geo Areas"
            className={_cs(className, styles.geoLocationModal)}
            size="cover"
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
            bodyClassName={styles.content}
        >
            <GeoLocationMapInput
                projectId={projectId}
                onChange={setTempGeoAreas}
                value={tempGeoAreas}
                geoAreaOptions={geoAreaOptions}
                onGeoAreaOptionsChange={onGeoAreaOptionsChange}
                rightComponent={rightComponent}
            />
        </Modal>
    );
}

export default GeoLocationModal;
