import React from 'react';
import {
    Container,
} from '@the-deep/deep-ui';
import { useParams } from 'react-router-dom';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';

import GeoDataSelectInput, {
    ReportGeoUploadType,
} from '#components/report/ReportBuilder/GeoDataSelectInput';

import {
    type SymbolLayerConfigType,
} from '../../../../../schema';

import styles from './styles.css';

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
    disabled?: boolean;
    readOnly?: boolean;
}

function SymbolLayerEdit<NAME extends string>(props: Props<NAME>) {
    const {
        value,
        onChange,
        error: riskyError,
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

    return (
        <Container
            heading="Layer Properties"
            contentClassName={styles.mapLayer}
        >
            {projectId && reportId && (
                <GeoDataSelectInput
                    name="uploadId"
                    value={value?.uploadId}
                    onChange={onFieldChange}
                    projectId={projectId}
                    reportId={reportId}
                    options={geoDataUploads}
                    label="Dataset"
                    onOptionsChange={onGeoDataUploadsChange}
                    types={['GEOJSON']}
                    disabled={disabled}
                    readOnly={readOnly}
                    error={error?.uploadId}
                />
            )}
        </Container>
    );
}

export default SymbolLayerEdit;
