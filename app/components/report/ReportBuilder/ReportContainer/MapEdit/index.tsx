import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    ExpandableContainer,
    Button,
} from '@the-deep/deep-ui';
import {
    useFormArray,
    type SetValueArg,
    type Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import {
    ReportMapEnumsQuery,
} from '#generated/types';

import { ReportGeoUploadType } from '#components/report/ReportBuilder/GeoDataSelectInput';

import MapLayerEdit from './MapLayerEdit';
import {
    type MapConfigType,
    type MapLayerType,
} from '../../../schema';

import styles from './styles.css';

const MAP_ENUMS = gql`
    query ReportMapEnums {
        enums {
            AnalysisReportMapLayerConfigurationSerializerType {
                description
                enum
                label
            }
        }
    }
`;

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    value: MapConfigType | undefined;
    onChange: (value: SetValueArg<MapConfigType | undefined>, name: NAME) => void;
    error?: Error<MapConfigType>;
    disabled?: boolean;
    geoDataUploads: ReportGeoUploadType[] | undefined | null;
    onGeoDataUploadsChange: React.Dispatch<React.SetStateAction<
        ReportGeoUploadType[] | undefined | null
    >>;
}

function MapEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        value,
        name,
        onChange,
        error: riskyError,
        disabled,
        geoDataUploads,
        onGeoDataUploadsChange,
    } = props;

    const {
        data: enumsData,
    } = useQuery<ReportMapEnumsQuery>(
        MAP_ENUMS,
    );

    const mapLayerTypeOptions = enumsData?.enums?.AnalysisReportMapLayerConfigurationSerializerType;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject<
        NAME, MapConfigType
    >(name, onChange, {});

    const {
        setValue: onMapLayerChange,
        removeValue: onMapLayerRemove,
    } = useFormArray<
        'layers',
        MapLayerType
    >('layers', onFieldChange);

    const mapLayersError = useMemo(
        () => getErrorObject(error?.layers),
        [error?.layers],
    );

    const handleAddMapLayer = useCallback(() => {
        onFieldChange(
            (oldValue: MapConfigType['layers']) => {
                const safeOldValue = oldValue ?? [];
                const newClientId = randomString();
                const newMapLayer: MapLayerType = {
                    clientId: newClientId,
                };
                return [...safeOldValue, newMapLayer];
            },
            'layers',
        );
    }, [onFieldChange]);

    return (
        <div className={_cs(className, styles.mapEdit)}>
            <NonFieldError error={error} />
            <ExpandableContainer
                heading="Layers"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                {value?.layers?.map((attribute, index) => (
                    <MapLayerEdit
                        key={attribute.clientId}
                        value={attribute}
                        index={index}
                        onChange={onMapLayerChange}
                        error={mapLayersError?.[attribute.clientId]}
                        typeOptions={mapLayerTypeOptions}
                        onRemove={onMapLayerRemove}
                        geoDataUploads={geoDataUploads}
                        onGeoDataUploadsChange={onGeoDataUploadsChange}
                    />
                ))}
                <Button
                    title="Add attributes"
                    name="addAttributes"
                    onClick={handleAddMapLayer}
                    className={styles.addButton}
                    variant="tertiary"
                    spacing="compact"
                    disabled={disabled}
                >
                    Add Layer
                </Button>
            </ExpandableContainer>
        </div>
    );
}

export default MapEdit;
