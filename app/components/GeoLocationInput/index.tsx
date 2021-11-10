import React, { useCallback, useState } from 'react';
import {
    QuickActionButton,
} from '@the-deep/deep-ui';
import { IoEarth } from 'react-icons/io5';
import NonFieldError from '#components/NonFieldError';
import { GeoLocationValue } from '#types/newAnalyticalFramework';
import GeoMultiSelectInput, { GeoArea } from '#components/GeoMultiSelectInput';
import ProjectContext from '#base/context/ProjectContext';
import { useModalState } from '#hooks/stateManagement';

import GeoLocationModal from './GeoLocationModal';

import styles from './styles.css';

interface Props<N extends string> {
    name: N;
    value: GeoLocationValue | null | undefined;
    onChange: (value: GeoLocationValue | undefined, name: N) => void,
    error?: string;
    readOnly?: boolean;
    disabled?: boolean;
    geoAreas: GeoArea[] | undefined | null;
    onGeoAreasChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
}

function GeoLocationInput<N extends string>(props: Props<N>) {
    const {
        name,
        value,
        onChange,
        disabled,
        readOnly,
        error,
        geoAreas,
        onGeoAreasChange,
    } = props;

    const [
        isGeoLocationModalVisible,
        showGeoLocationModal,
        hideGeoLocationModal,
    ] = useModalState(false);

    const [
        tempGeoAreas,
        setTempGeoAreas,
    ] = useState<string[] | null | undefined>(value);

    const handleGeoAreasSelection = useCallback((geoAreaIds: string[] | null | undefined) => {
        onChange(geoAreaIds ?? undefined, name);
        setTempGeoAreas(geoAreaIds);
    }, [name, onChange]);

    const handleModalClose = useCallback(() => {
        setTempGeoAreas(value);
        hideGeoLocationModal();
    }, [hideGeoLocationModal, value]);

    const handleModalSubmit = useCallback(() => {
        onChange(tempGeoAreas ?? undefined, name);
        setTempGeoAreas(undefined);
        hideGeoLocationModal();
    }, [onChange, hideGeoLocationModal, name, tempGeoAreas]);

    const { project } = React.useContext(ProjectContext);

    return (
        <div className={styles.geoLocationInput}>
            <NonFieldError error={error} />
            {project?.id && (
                <>
                    <GeoMultiSelectInput
                        className={styles.input}
                        name="geoMultiSelect"
                        value={value}
                        onChange={handleGeoAreasSelection}
                        label=" Geo Locations"
                        projectId={project.id}
                        options={geoAreas}
                        onOptionsChange={onGeoAreasChange}
                        disabled={disabled}
                        placeholder="Select geo locations"
                        readOnly={readOnly}
                        actionsContainerClassName={styles.showGeoLocationModalButton}
                        actions={(
                            <QuickActionButton
                                title="Show Geo Location Modal"
                                name="geoLocationModalButton"
                                variant="action"
                                disabled={disabled}
                                readOnly={readOnly}
                                onClick={showGeoLocationModal}
                            >
                                <IoEarth />
                            </QuickActionButton>
                        )}
                    />
                    {isGeoLocationModalVisible && (
                        <GeoLocationModal
                            onModalClose={handleModalClose}
                            projectId={project.id}
                            tempGeoAreas={tempGeoAreas ?? value}
                            onTempGeoAreasChange={setTempGeoAreas}
                            geoAreaOptions={geoAreas}
                            onGeoAreaOptionsChange={onGeoAreasChange}
                            onSubmit={handleModalSubmit}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default GeoLocationInput;
