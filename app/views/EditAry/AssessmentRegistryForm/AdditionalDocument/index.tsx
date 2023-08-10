import React, { useCallback, useMemo } from 'react';
import { EntriesAsList, Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';
import {
    TextArea,
    Heading,
} from '@the-deep/deep-ui';
import { isDefined } from '@togglecorp/fujs';

import { GalleryFileType } from '#generated/types';

import FileUpload from './FileUpload';
import { PartialFormType } from '../formSchema';

import styles from './styles.css';

interface Props {
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
    disabled?: boolean;
    readOnly?: boolean;
    setUploadedList: React.Dispatch<React.SetStateAction<GalleryFileType[] | undefined>>;
    uploadedList?: GalleryFileType[];
}

function AdditionalDocument(props: Props) {
    const {
        value: formValue,
        setFieldValue,
        error: riskyError,
        disabled,
        readOnly,
        uploadedList,
        setUploadedList,
    } = props;

    const error = getErrorObject(riskyError);

    const handleFileUploadSuccess = useCallback(
        (
            formFile: NonNullable<PartialFormType['additionalDocuments']>[number],
            uploadedValue?: GalleryFileType,
        ) => {
            setFieldValue(
                (oldVal: PartialFormType['additionalDocuments']) => ([
                    ...(oldVal ?? []),
                    formFile,
                ]),
                'additionalDocuments',
            );
            if (isDefined(uploadedValue)) {
                setUploadedList((prev) => ([
                    ...(prev ?? []),
                    uploadedValue,
                ]));
            }
        },
        [setFieldValue, setUploadedList],
    );

    const handleFileRemove = useCallback(
        (key: string) => {
            setFieldValue(
                (oldVal: PartialFormType['additionalDocuments']) => oldVal?.filter(
                    (v) => v.clientId !== key,
                ) ?? [],
                'additionalDocuments',
            );
        }, [setFieldValue],
    );

    const [
        assessmentFiles,
        questionnaireFiles,
        miscellaneousFiles,
    ] = useMemo(() => {
        const dataset = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'ASSESSMENT_DATABASE',
        );

        const questionnaire = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'QUESTIONNAIRE',
        );

        const miscellaneous = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'MISCELLANEOUS',
        );

        return [
            dataset,
            questionnaire,
            miscellaneous,
        ];
    }, [formValue]);

    return (
        <div className={styles.additionalDocument}>
            <TextArea
                label={<Heading size="extraSmall">Executive Summary</Heading>}
                name="executiveSummary"
                value={formValue.executiveSummary}
                onChange={setFieldValue}
                error={getErrorString(error?.executiveSummary)}
                rows={18}
                disabled={disabled}
                readOnly={readOnly}
            />
            <FileUpload
                title="Assessment Dataset"
                name="ASSESSMENT_DATABASE"
                onSuccess={handleFileUploadSuccess}
                handleFileRemove={handleFileRemove}
                acceptFileType=".pdf"
                value={assessmentFiles}
                uploadedList={uploadedList}
                supportLinkAddition
            />
            <FileUpload
                title="Questionnaire"
                name="QUESTIONNAIRE"
                onSuccess={handleFileUploadSuccess}
                handleFileRemove={handleFileRemove}
                acceptFileType=".pdf"
                value={questionnaireFiles}
                uploadedList={uploadedList}
            />
            <FileUpload
                title="Miscellaneous"
                name="MISCELLANEOUS"
                onSuccess={handleFileUploadSuccess}
                handleFileRemove={handleFileRemove}
                value={miscellaneousFiles}
                uploadedList={uploadedList}
            />
        </div>
    );
}

export default AdditionalDocument;
