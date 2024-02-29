import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useParams } from 'react-router-dom';
import {
    type SetValueArg,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import DatasetSelectInput, {
    BasicAnalysisReportUpload,
} from '../../DatasetSelectInput';
import {
    type BarChartConfigType,
} from '../../../schema';

import styles from './styles.css';

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    onChange: (value: SetValueArg<BarChartConfigType | undefined>, name: NAME) => void;
    error?: Error<BarChartConfigType>;
}

function BarChartChartEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        onChange,
        name,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);
    const [selectedFile, setSelectedFile] = useState<string>();
    const [selectedSheet, setSelectedSheet] = useState<string>();
    const [options, setOptions] = useState<BasicAnalysisReportUpload[] | undefined | null>();

    const {
        reportId,
        projectId,
    } = useParams<{
        projectId: string | undefined,
        reportId: string | undefined,
    }>();

    const handleDataFetch = useCallback((columns: string[], data: unknown[]) => {
        console.log('data', columns, data);
    }, []);

    return (
        <div className={_cs(className, styles.barChartChartEdit)}>
            <NonFieldError error={error} />
            {projectId && reportId && (
                <DatasetSelectInput
                    name="here"
                    value={selectedFile}
                    onChange={setSelectedFile}
                    projectId={projectId}
                    reportId={reportId}
                    options={options}
                    label="Here"
                    onOptionsChange={setOptions}
                    types={['XLSX']}
                    sheetValue={selectedSheet}
                    onSheetValueChange={setSelectedSheet}
                    onDataFetch={handleDataFetch}
                />
            )}
        </div>
    );
}

export default BarChartChartEdit;
