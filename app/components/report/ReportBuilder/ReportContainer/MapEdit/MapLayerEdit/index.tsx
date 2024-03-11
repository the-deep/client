import React from 'react';
import { randomString } from '@togglecorp/fujs';
import {
    ExpandableContainer,
    QuickActionButton,
    SegmentInput,
    TextInput,
    NumberInput,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { IoTrash } from 'react-icons/io5';

import BooleanInput from '#components/selections/BooleanInput';
import {
    AnalysisReportMapLayerTypeEnum,
} from '#generated/types';
import {
    NewEnumEntity,
    newEnumKeySelector,
    newEnumLabelSelector,
} from '#utils/common';
import { ReportGeoUploadType } from '#components/report/ReportBuilder/GeoDataSelectInput';

import {
    type MapLayerType,
    type MapLayerConfigType,
} from '../../../../schema';

import SymbolLayerEdit from './SymbolLayer';

import styles from './styles.css';

const defaultMapLayer = (): MapLayerType => ({
    clientId: randomString(),
});

interface Props {
    value: MapLayerType;
    typeOptions: NewEnumEntity<AnalysisReportMapLayerTypeEnum>[] | undefined | null;
    onChange: (
        value: SetValueArg<MapLayerType>,
        index: number,
    ) => void | undefined;
    onRemove: (index: number) => void;
    geoDataUploads: ReportGeoUploadType[] | undefined | null;
    onGeoDataUploadsChange: React.Dispatch<React.SetStateAction<
        ReportGeoUploadType[] | undefined | null
    >>;
    index: number;
    error: Error<MapLayerType> | undefined;
    disabled?: boolean;
    readOnly?: boolean;
}

function MapLayerEdit(props: Props) {
    const {
        value,
        onChange,
        index,
        error: riskyError,
        onRemove,
        disabled,
        readOnly,
        typeOptions,
        geoDataUploads,
        onGeoDataUploadsChange,
    } = props;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject(
        index,
        onChange,
        defaultMapLayer,
    );

    console.log('value', value);

    const onLayerConfigChange = useFormObject<
        'layerConfig', MapLayerConfigType
    >('layerConfig', onFieldChange, {});

    return (
        <ExpandableContainer
            heading={value.name ?? `Item: ${index + 1}`}
            headerActions={(
                <QuickActionButton
                    title="Remove Attributes"
                    name={index}
                    onClick={onRemove}
                >
                    <IoTrash />
                </QuickActionButton>
            )}
            contentClassName={styles.mapLayer}
            withoutBorder
        >
            <TextInput
                label="Name"
                name="name"
                onChange={onFieldChange}
                error={error?.name}
                value={value.name}
                disabled={disabled}
                readOnly={readOnly}
            />
            <SegmentInput
                label="Layer Type"
                name="type"
                value={value?.type}
                onChange={onFieldChange}
                keySelector={newEnumKeySelector}
                labelSelector={newEnumLabelSelector}
                options={typeOptions ?? []}
                error={error?.type}
                spacing="compact"
            />
            <NumberInput
                name="opacity"
                label="Opacity"
                value={value?.opacity}
                onChange={onFieldChange}
                error={error?.opacity}
                disabled={disabled}
                readOnly={readOnly}
            />
            <BooleanInput
                name="visible"
                label="Layer Visibility"
                value={value?.visible}
                onChange={onFieldChange}
            />
            {value?.type === 'SYMBOL_LAYER' && (
                <SymbolLayerEdit
                    name="symbolLayer"
                    value={value?.layerConfig?.symbolLayer}
                    onChange={onLayerConfigChange}
                    geoDataUploads={geoDataUploads}
                    onGeoDataUploadsChange={onGeoDataUploadsChange}
                    error={getErrorObject(error?.layerConfig)?.symbolLayer}
                />
            )}
        </ExpandableContainer>
    );
}

export default MapLayerEdit;
