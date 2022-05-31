import React, { useContext, useMemo, useState, useCallback } from 'react';
import {
    _cs,
    randomString,
    isDefined,
} from '@togglecorp/fujs';
import {
    Modal,
    Button,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    getErrorObject,
} from '@togglecorp/toggle-form';
import { getOperationName } from 'apollo-link';

import _ts from '#ts';
import { RequestItem } from '#hooks/useBatchManager';
import { apolloClient } from '#base/configs/apollo';
import { UserContext } from '#base/context/UserContext';

import { PROJECT_SOURCES } from '#views/Project/Tagging/Sources/queries';

import {
    PartialLeadType,
    PartialFormType,
} from './schema';

import UploadPane from './UploadPane';
import LeadsPane from './LeadsPane';
import { useBulkLeads, Req, Res, Err } from './hook';
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

function BulkUploadModal(props: Props) {
    const {
        className,
        onClose,
        projectId,
    } = props;

    // Store uploaded files on memory to show preview
    // NOTE: If a lead is removed or saved, uploaded files are not being removed at the moment
    const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);

    const [selectedLead, setSelectedLead] = useState<string | undefined>();

    const { user } = useContext(UserContext);

    const handleComplete = useCallback(
        (requests: RequestItem<string, Req, Res, Err>[]) => {
            const firstFailedRequest = requests.find(
                (request) => request.status === 'failed',
            );
            setSelectedLead(firstFailedRequest?.key);

            apolloClient.refetchQueries({
                include: [getOperationName(PROJECT_SOURCES)].filter(isDefined),
            });
        },
        [],
    );

    const {
        formValue,
        formPristine,
        formError,
        bulkUpdateLeadsPending,
        handleLeadChange,
        handleLeadRemove,
        handleSubmit,
        setFormFieldValue,
    } = useBulkLeads(
        projectId,
        handleComplete,
    );

    const leadsError = useMemo(
        () => getErrorObject(getErrorObject(formError)?.leads),
        [formError],
    );

    const selectedLeadAttachment = useMemo(
        () => {
            if (!selectedLead) {
                return undefined;
            }
            const selectedLeadData = formValue?.leads?.find(
                (lead) => lead.clientId === selectedLead,
            );
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
        },
        [uploadedFiles, selectedLead, formValue],
    );

    const handleFileUploadSuccess = useCallback(
        (value: FileUploadResponse) => {
            setUploadedFiles((oldUploadedFiles) => ([
                value,
                ...oldUploadedFiles,
            ]));

            const newLead: PartialLeadType = {
                clientId: randomString(),
                sourceType: sourceTypeMap[value.sourceType],
                priority: 'LOW',
                confidentiality: 'UNPROTECTED',
                isAssessmentLead: false,
                assignee: user?.id,

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
            setSelectedLead((oldSelection) => (
                oldSelection ?? newLead.clientId
            ));
        },
        [setUploadedFiles, setFormFieldValue, user],
    );

    return (
        <Modal
            className={_cs(className, styles.bulkUploadModal)}
            heading={_ts('bulkUpload', 'title')}
            size="cover"
            onCloseButtonClick={onClose}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name={undefined}
                    disabled={
                        formPristine
                        || bulkUpdateLeadsPending
                        || (formValue.leads?.length ?? 0) < 1
                    }
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            )}
        >
            {bulkUpdateLeadsPending && <PendingMessage />}
            <UploadPane
                className={styles.upload}
                onSuccess={handleFileUploadSuccess}
            />
            <LeadsPane
                leads={formValue.leads}
                className={styles.details}
                onLeadRemove={handleLeadRemove}
                selectedLead={selectedLead}
                leadsError={leadsError}
                onLeadChange={handleLeadChange}
                onSelectedLeadChange={setSelectedLead}
                selectedLeadAttachment={selectedLeadAttachment}
                projectId={projectId}
            />
        </Modal>
    );
}

export default BulkUploadModal;
