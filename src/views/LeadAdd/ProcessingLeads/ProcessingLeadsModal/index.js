import React, { useCallback, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import DangerButton from '#rsca/Button/DangerButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Button from '#rsca/Button';
import ListView from '#rscv/List/ListView';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import { LeadProcessorContext } from '../../LeadProcessor';
import {
    leadKeySelector,
    leadFaramValuesSelector,
} from '../../utils';
import LeadListItem from '../../LeadListItem';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    closeModal: PropTypes.func,
    onLeadsAdd: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
    closeModal: undefined,
};

function ProcessingLeadsModal(props) {
    const {
        className,
        onLeadsAdd,
        closeModal,
    } = props;

    const {
        clearProcessingLeads,
        processingLeads,
        fileUploadStatuses,
        driveUploadStatuses,
        dropboxUploadStatuses,
        removeProcessingLead,
    } = useContext(LeadProcessorContext);

    const processingLeadsRendererParams = useCallback((key, data) => {
        const handleLeadRemove = () => removeProcessingLead(key);

        const actionButtons = (
            <Button
                className={styles.button}
                onClick={handleLeadRemove}
                iconName="delete"
            />
        );

        return ({
            title: leadFaramValuesSelector(data)?.title,
            lead: data,
            progress: fileUploadStatuses?.[key]?.progress,
            actionButtons,
        });
    }, [fileUploadStatuses, removeProcessingLead]);

    const isFileUploadPending = useMemo(() => (
        Object.values(fileUploadStatuses).some(fileUploadStatus => (
            fileUploadStatus.progress !== 100
        ))
    ), [fileUploadStatuses]);

    const isDriveUploadPending = useMemo(() => (
        Object.values(driveUploadStatuses).some(driveUploadStatus => (
            driveUploadStatus.pending
        ))
    ), [driveUploadStatuses]);

    const isDropboxUploadPending = useMemo(() => (
        Object.values(dropboxUploadStatuses).some(dropboxUploadStatus => (
            dropboxUploadStatus.pending
        ))
    ), [dropboxUploadStatuses]);

    const isInProgress = isFileUploadPending
     || isDriveUploadPending
     || isDropboxUploadPending;

    const handleLeadsAdd = useCallback(() => {
        onLeadsAdd(processingLeads);
        clearProcessingLeads();
        closeModal();
    }, [
        processingLeads,
        onLeadsAdd,
        clearProcessingLeads,
        closeModal,
    ]);

    return (
        <Modal
            className={_cs(className, styles.processingLeads)}
            closeOnEscape
            onClose={closeModal}
        >
            <ModalHeader
                // FIXME: Use translation
                title={`Processing Leads (${processingLeads.length})`}
                rightComponent={(
                    <DangerButton
                        iconName="contractContent"
                        onClick={closeModal}
                        transparent
                    />
                )}
            />
            <ModalBody className={styles.modalBody}>
                <ListView
                    data={processingLeads}
                    className={styles.processingLeadsList}
                    keySelector={leadKeySelector}
                    renderer={LeadListItem}
                    rendererParams={processingLeadsRendererParams}
                />
            </ModalBody>
            <ModalFooter>
                <DangerConfirmButton
                    onClick={clearProcessingLeads}
                    // FIXME: Use translation
                    confirmationMessage="Are you sure you want to clear all processing leads?"
                >
                    {/* FIXME: use translation */}
                    Clear All
                </DangerConfirmButton>
                <PrimaryButton
                    disabled={isInProgress}
                    onClick={handleLeadsAdd}
                >
                    {/* FIXME: use translation */}
                    Load
                </PrimaryButton>
            </ModalFooter>
        </Modal>
    );
}

ProcessingLeadsModal.propTypes = propTypes;
ProcessingLeadsModal.defaultProps = defaultProps;

export default ProcessingLeadsModal;
