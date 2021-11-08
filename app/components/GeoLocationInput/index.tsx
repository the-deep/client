import React, { useState, useCallback } from 'react';
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
}

function GeoLocationInput<N extends string>(props: Props<N>) {
    const {
        name,
        value,
        onChange,
        disabled,
        readOnly,
        error,
    } = props;

    const [
        isGeoLocationModalVisible,
        showGeoLocationModal,
        hideGeoLocationModal,
    ] = useModalState(false);

    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(undefined);

    const handleGeoAreasSelection = useCallback((geoAreaIds: string[] | undefined) => {
        onChange(geoAreaIds, name);
    }, [name, onChange]);

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
                        options={geoAreaOptions}
                        onOptionsChange={setGeoAreaOptions}
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
                            onModalClose={hideGeoLocationModal}
                            projectId={project.id}
                            selectedGeoAreas={value}
                            geoAreaOptions={geoAreaOptions}
                            onGeoAreaOptionsChange={setGeoAreaOptions}
                            onChange={handleGeoAreasSelection}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default GeoLocationInput;
