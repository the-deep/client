import React, { useCallback } from 'react';
import {
    Button,
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
    showList?: boolean;
    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
}

function GeoLocationInput<N extends string>(props: Props<N>) {
    const {
        name,
        value,
        onChange,
        disabled,
        readOnly,
        error,
        showList,
        geoAreaOptions,
        onGeoAreaOptionsChange,
    } = props;

    const [
        isGeoLocationModalVisible,
        showGeoLocationModal,
        hideGeoLocationModal,
    ] = useModalState(false);

    const handleGeoAreasSelection = useCallback((geoAreaIds: string[] | null | undefined) => {
        onChange(geoAreaIds ?? undefined, name);
    }, [name, onChange]);

    const handleModalClose = useCallback(() => {
        hideGeoLocationModal();
    }, [hideGeoLocationModal]);

    const handleModalSubmit = useCallback((newVal: string[] | undefined) => {
        onChange(newVal, name);
        hideGeoLocationModal();
    }, [onChange, hideGeoLocationModal, name]);

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
                        // label=" Geo Locations"
                        projectId={project.id}
                        options={geoAreaOptions}
                        onOptionsChange={onGeoAreaOptionsChange}
                        disabled={disabled}
                        // placeholder="Select geo locations"
                        readOnly={readOnly}
                        actionsContainerClassName={styles.showGeoLocationModalButton}
                        actions={!readOnly && (
                            <Button
                                title="Show Geo Location Modal"
                                name={undefined}
                                variant="action"
                                disabled={disabled}
                                onClick={showGeoLocationModal}
                            >
                                <IoEarth />
                            </Button>
                        )}
                        selectionListShown={showList}
                    />
                    {isGeoLocationModalVisible && (
                        <GeoLocationModal
                            onModalClose={handleModalClose}
                            projectId={project.id}
                            initialValue={value}
                            geoAreaOptions={geoAreaOptions}
                            onGeoAreaOptionsChange={onGeoAreaOptionsChange}
                            onSubmit={handleModalSubmit}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default GeoLocationInput;
