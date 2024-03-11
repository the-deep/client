import React, { useCallback, useMemo } from 'react';
import {
    Container,
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
} from '../../../../../schema';

import styles from './styles.css';

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

    return (
        <Container
            heading="Layer Properties"
            contentClassName={styles.mapLayer}
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
                label="Column"
                name="labelColumn"
                value={value?.labelColumn}
                onChange={onFieldChange}
                keySelector={columnKeySelector}
                labelSelector={columnLabelSelector}
                error={error?.labelColumn}
                options={propertyOptions}
                disabled={disabled}
                readOnly={readOnly}
            />
        </Container>
    );
}

export default SymbolLayerEdit;
