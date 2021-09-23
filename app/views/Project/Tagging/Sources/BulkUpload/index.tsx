import React, { useMemo, useState, useCallback } from 'react';
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
import {
    FileUploadResponse,
    sourceTypeMap,
} from './types';
import styles from './styles.css';

interface Props {
    className?: string;
    onClose: () => void;
    projectId: string;
}

function BulkUpload(props: Props) {
    const {
        className,
        onClose,
        projectId,
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
            sourceType: sourceTypeMap[value.sourceType],
            confidentiality: 'UNPROTECTED',
            priority: 'LOW',
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
        if (!selectedLead) {
            setSelectedLead(newLead.clientId);
        }
    }, [setUploadedFiles, setFormFieldValue, selectedLead]);

    const handleLeadRemove = useCallback((clientId: string) => {
        const selectedLeadObj = formValue?.leads?.find((lead) => lead.clientId === clientId);
        setFormFieldValue((oldVal) => oldVal?.filter((lead) => lead.clientId !== clientId), 'leads');
        if (selectedLeadObj?.attachment) {
            setUploadedFiles((oldState: FileUploadResponse[]) => {
                const updatedState = produce(oldState, (safeState) => {
                    const index = safeState.findIndex(
                        (file) => String(file.id) === selectedLeadObj.attachment,
                    );
                    if (index !== -1) {
                        safeState.splice(index, 1);
                    }
                });
                return updatedState;
            });
        }
    }, [formValue, setFormFieldValue]);

    const selectedLeadAttachment = useMemo(() => {
        if (!selectedLead) {
            return undefined;
        }
        const selectedLeadData = formValue?.leads?.find((lead) => lead.clientId === selectedLead);
        if (!selectedLeadData) {
            return undefined;
        }
        const selectedFile = uploadedFiles?.find(
            (file) => String(file.id) === selectedLeadData.attachment,
        );
        if (!selectedFile) {
            return undefined;
        }
        return ({
            id: String(selectedFile.id),
            title: selectedFile.title,
            mimeType: selectedFile.mimeType,
            file: selectedFile.file ? { url: selectedFile.file } : undefined,
        });
    }, [uploadedFiles, selectedLead, formValue]);

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
                onLeadRemove={handleLeadRemove}
                selectedLead={selectedLead}
                onLeadChange={handleLeadChange}
                onSelectedLeadChange={setSelectedLead}
                selectedLeadAttachment={selectedLeadAttachment}
                projectId={projectId}
            />
        </Modal>
    );
}

export default BulkUpload;
