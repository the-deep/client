import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { read } from 'xlsx';
import {
    type SetValueArg,
    type Error,
    getErrorObject,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    useAlert,
    ExpandableContainer,
    FileInput,
} from '@the-deep/deep-ui';

import { IoCloudUpload } from 'react-icons/io5';
import NonFieldError from '#components/NonFieldError';

import DatasetsConfigureButton from '../../DatasetsConfigureButton';
import {
    type TextConfigType,
    type TextContentStyleFormType,
} from '../../../schema';

import styles from './styles.css';

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    value: TextConfigType | undefined;
    onChange: (value: SetValueArg<TextConfigType | undefined>, name: NAME) => void;
    error?: Error<TextConfigType>;
    disabled?: boolean;
}

function TimeseriesChartEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        value,
        onChange,
        name,
        error: riskyError,
        disabled,
    } = props;

    const error = getErrorObject(riskyError);
    const alert = useAlert();

    const onFieldChange = useFormObject<
        NAME, TextConfigType
    >(name, onChange, {});

    const onStyleChange = useFormObject<
        'style', TextContentStyleFormType
    >('style', onFieldChange, {});

    const handleFileInputChange = useCallback(
        async (fileValue: File | null | undefined) => {
            if (!fileValue) {
                return;
            }

            try {
                const arrayB = await fileValue.arrayBuffer();
                const workbook = read(arrayB, { type: 'binary' });

                console.log('here', workbook);
            } catch {
                alert.show(
                    'There was an error parsing the excel sheet.',
                    { variant: 'error' },
                );
            }
        },
        [alert],
    );

    return (
        <div className={_cs(className, styles.timeseriesChartEdit)}>
            <NonFieldError error={error} />
            <ExpandableContainer
                heading="Configure"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <FileInput
                    name={undefined}
                    value={null}
                    onChange={handleFileInputChange}
                    status={undefined}
                    overrideStatus
                    title="Upload File"
                    maxFileSize={100}
                    disabled={disabled}
                >
                    <IoCloudUpload />
                </FileInput>
                <DatasetsConfigureButton />
            </ExpandableContainer>
        </div>
    );
}

export default TimeseriesChartEdit;
