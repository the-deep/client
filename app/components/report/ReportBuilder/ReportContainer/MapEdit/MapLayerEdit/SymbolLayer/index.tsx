import React, { useCallback, useMemo } from 'react';
import {
    ContainerCard,
    Checkbox,
    NumberInput,
    SelectInput,
} from '@the-deep/deep-ui';
import { useParams } from 'react-router-dom';
import {
    randomString,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';

import {
    AnalysisReportVariableType,
} from '#generated/types';
import GeoDataSelectInput, {
    ReportGeoUploadType,
} from '#components/report/ReportBuilder/GeoDataSelectInput';

import {
    type ContentDataType,
    type SymbolLayerConfigType,
    type SymbolLayerStyleConfigType,
} from '../../../../../schema';
import TextElementsStylesEdit from '../../../TextElementsStylesEdit';

import styles from './styles.css';

const symbolIcons = [
    { key: 'airport', label: 'airport' },
    { key: 'borderCrossing', label: 'borderCrossing' },
    { key: 'borderCrossingActive', label: 'borderCrossingActive' },
    { key: 'borderCrossingPotential', label: 'borderCrossingPotential' },
    { key: 'capital', label: 'capital' },
    { key: 'circle', label: 'circle' },
    { key: 'city', label: 'city' },
    { key: 'idpRefugeeCamp', label: 'idpRefugeeCamp' },
    { key: 'marker', label: 'marker' },
    { key: 'settlement', label: 'settlement' },
    { key: 'triangle', label: 'triangle' },
];

const symbolKeySelector = (item: { key: string }) => item.key;
const symbolLabelSelector = (item: { label: string }) => item.label;

const columnKeySelector = (item: AnalysisReportVariableType) => item.clientId ?? '';
const columnLabelSelector = (item: AnalysisReportVariableType) => item.name ?? '';

interface Props<NAME extends string> {
    name: NAME;
    value: SymbolLayerConfigType | undefined;
    onChange: (
        value: SetValueArg<SymbolLayerConfigType>,
        name: NAME,
    ) => void;
    error: Error<SymbolLayerConfigType> | undefined;
    geoDataUploads: ReportGeoUploadType[] | undefined | null;
    onGeoDataUploadsChange: React.Dispatch<React.SetStateAction<
        ReportGeoUploadType[] | undefined | null
    >>;
    contentData: ContentDataType[] | undefined;
    onContentDataChange: (newContentData: SetValueArg<ContentDataType[] | undefined>) => void;
    disabled?: boolean;
    readOnly?: boolean;
}

function SymbolLayerEdit<NAME extends string>(props: Props<NAME>) {
    const {
        value,
        onChange,
        error: riskyError,
        contentData,
        onContentDataChange,
        disabled,
        readOnly,
        name,
        geoDataUploads,
        onGeoDataUploadsChange,
    } = props;

    const error = getErrorObject(riskyError);

    const {
        reportId,
        projectId,
    } = useParams<{
        projectId: string | undefined,
        reportId: string | undefined,
    }>();

    const onFieldChange = useFormObject<
        NAME, SymbolLayerConfigType
    >(name, onChange, {});

    const handleFileUploadChange = useCallback((newFileUploadId: string | undefined) => {
        const newReferenceId = randomString();
        onContentDataChange((oldVal) => {
            if (!oldVal) {
                return ([{
                    clientId: newReferenceId,
                    clientReferenceId: newReferenceId,
                    upload: newFileUploadId,
                }]);
            }
            const selectedIndex = (oldVal ?? [])?.findIndex(
                (item) => item.clientReferenceId === value?.contentReferenceId,
            );
            if (selectedIndex === -1 && isDefined(newFileUploadId)) {
                return ([
                    ...oldVal,
                    {
                        clientId: newReferenceId,
                        clientReferenceId: newReferenceId,
                        upload: newFileUploadId,
                    },
                ]);
            }
            const newVal = [...oldVal];
            if (selectedIndex !== -1 && isNotDefined(newFileUploadId)) {
                newVal.splice(
                    selectedIndex,
                    1,
                );
            } else {
                newVal.splice(
                    selectedIndex,
                    1,
                    {
                        clientId: newReferenceId,
                        clientReferenceId: newReferenceId,
                        upload: newFileUploadId,
                    },
                );
            }
            return newVal;
        });
        onFieldChange(newReferenceId, 'contentReferenceId');
    }, [
        onFieldChange,
        value?.contentReferenceId,
        onContentDataChange,
    ]);

    const fileId = useMemo(() => (
        contentData?.find((item) => item.clientReferenceId === value?.contentReferenceId)?.upload
    ), [
        contentData,
        value?.contentReferenceId,
    ]);

    const propertyOptions = useMemo(() => (
        geoDataUploads?.find((item) => item.id === fileId)?.metadata?.geojson?.variables
    ), [
        geoDataUploads,
        fileId,
    ]);

    const onStyleChange = useFormObject<
        'style', SymbolLayerStyleConfigType
    >('style', onFieldChange, {});

    return (
        <ContainerCard
            heading="Layer Properties"
            headingSize="extraSmall"
            contentClassName={styles.mapLayer}
            className={styles.mapLayerEdit}
        >
            {projectId && reportId && (
                <GeoDataSelectInput
                    name="contentReferenceId"
                    value={fileId}
                    onChange={handleFileUploadChange}
                    projectId={projectId}
                    reportId={reportId}
                    options={geoDataUploads}
                    label="Dataset"
                    onOptionsChange={onGeoDataUploadsChange}
                    types={['GEOJSON']}
                    disabled={disabled}
                    readOnly={readOnly}
                    error={error?.contentReferenceId}
                />
            )}
            <SelectInput
                label="Label"
                name="labelPropertyKey"
                value={value?.labelPropertyKey}
                onChange={onFieldChange}
                keySelector={columnKeySelector}
                labelSelector={columnLabelSelector}
                error={error?.labelPropertyKey}
                options={propertyOptions}
                disabled={disabled}
                readOnly={readOnly}
            />
            <SelectInput
                label="Symbol"
                name="symbol"
                value={value?.symbol}
                onChange={onFieldChange}
                keySelector={symbolKeySelector}
                labelSelector={symbolLabelSelector}
                error={error?.symbol}
                options={symbolIcons}
                disabled={disabled}
                readOnly={readOnly}
            />
            <Checkbox
                label="Show labels"
                name="showLabels"
                value={value?.showLabels}
                onChange={onFieldChange}
                disabled={disabled}
                readOnly={readOnly}
            />
            <NumberInput
                label="Scale"
                name="scale"
                value={value?.scale}
                error={error?.scale}
                onChange={onFieldChange}
                disabled={disabled}
                readOnly={readOnly}
            />
            <TextElementsStylesEdit
                name="symbol"
                label="Symbol Style"
                value={value?.style?.symbol}
                onChange={onStyleChange}
            />
            <TextElementsStylesEdit
                name="label"
                label="Label Style"
                value={value?.style?.label}
                onChange={onStyleChange}
            />
        </ContainerCard>
    );
}

export default SymbolLayerEdit;
