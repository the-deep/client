import React, { useState, useCallback } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import { produce } from 'immer';
import {
    Modal,
} from '@the-deep/deep-ui';
import {
    useForm,
    useFormArray,
    SetValueArg,
    isCallable,
} from '@togglecorp/toggle-form';

import _ts from '#ts';

import {
    schema,
    PartialLeadType,
    PartialFormType,
    defaultFormValues,
} from './schema';

import Upload from './Upload';
import FilesUploaded from './FilesUploaded';
import { FileUploadResponse } from './types';
import styles from './styles.css';

interface Props {
    className?: string;
    onClose: () => void;
}

function BulkUpload(props: Props) {
    const {
        className,
        onClose,
    } = props;

    const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);
    const [selectedLead, setSelectedLead] = useState<string | undefined>();

    const {
        value: formValue,
        // setValue: setFormValue,
        setFieldValue: setFormFieldValue,
        // setError: setFormError,
        // pristine: formPristine,
    } = useForm(schema, defaultFormValues);

    const {
        setValue: onLeadChange,
    } = useFormArray<'leads', PartialLeadType>('leads', setFormFieldValue);

    const handleLeadChange = useCallback(
        (val: SetValueArg<PartialLeadType>, otherName: number | undefined) => {
            onLeadChange(
                (oldValue) => {
                    const newVal = !isCallable(val)
                        ? val
                        : val(oldValue);
                    return newVal;
                },
                otherName,
            );
        },
        [onLeadChange],
    );

    const handleFileUploadSuccess = useCallback((value: FileUploadResponse) => {
        setUploadedFiles((oldUploadedFiles) => ([
            value,
            ...oldUploadedFiles,
        ]));
        const newLead: PartialLeadType = {
            clientId: randomString(),
            sourceType: 'WEBSITE',
            confidentiality: 'UNPROTECTED',
            isAssessmentLead: false,
            attachment: String(value.id),
            title: value.title,
        };
        setFormFieldValue(
            (oldVal: PartialFormType['leads']) => [
                ...(oldVal ?? []),
                newLead,
            ],
            'leads',
        );
    }, [setFormFieldValue]);

    const handleDeleteFile = useCallback((id: string) => {
        setUploadedFiles((oldState: FileUploadResponse[]) => {
            const updatedState = produce(oldState, (safeState) => {
                const index = safeState.findIndex(
                    (file: FileUploadResponse) => String(file.id) === id,
                );
                if (index !== -1) {
                    safeState.splice(index, 1);
                }
            });
            return updatedState;
        });
    }, []);

    return (
        <Modal
            className={_cs(className, styles.bulkUploadModal)}
            heading={_ts('bulkUpload', 'title')}
            headerClassName={styles.modalHeader}
            onCloseButtonClick={onClose}
            bodyClassName={styles.modalBody}
        >
            <Upload
                className={styles.upload}
                onSuccess={handleFileUploadSuccess}
            />
            <FilesUploaded
                leads={formValue.leads}
                className={styles.details}
                onDeleteFile={handleDeleteFile}
                selectedLead={selectedLead}
                onSelectedLeadChange={setSelectedLead}
            />
        </Modal>
    );
}

export default BulkUpload;
