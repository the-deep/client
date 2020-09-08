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
    LEAD_STATUS,
    leadKeySelector,
    leadFaramValuesSelector,
    leadSourceTypeSelector,
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

function CandidateLeadsModal(props) {
    const {
        className,
        onLeadsAdd,
        closeModal,
    } = props;

    const {
        clearCandidateLeads,
        candidateLeads,
        removeCandidateLead,
    } = useContext(LeadProcessorContext);

    const candidateLeadsRendererParams = useCallback((key, data) => {
        const handleLeadRemove = () => removeCandidateLead(key);

        const actionButtons = (
            <Button
                className={styles.button}
                onClick={handleLeadRemove}
                iconName="delete"
            />
        );

        return ({
            itemKey: key,
            title: leadFaramValuesSelector(data)?.title,
            type: leadSourceTypeSelector(data),
            progress: data.progress,
            actionButtons,
            itemState: data.leadState,
        });
    }, [removeCandidateLead]);

    const isInProgress = useMemo(() => (
        candidateLeads.some(candidateLead => (
            candidateLead.leadState !== LEAD_STATUS.uploading
        ))
    ), [candidateLeads]);

    const handleLeadsAdd = useCallback(() => {
        onLeadsAdd(candidateLeads);
        clearCandidateLeads();
        closeModal();
    }, [
        candidateLeads,
        onLeadsAdd,
        clearCandidateLeads,
        closeModal,
    ]);

    return (
        <Modal
            className={_cs(className, styles.candidateLeads)}
            closeOnEscape
            onClose={closeModal}
        >
            <ModalHeader
                // TODO: Translate string
                title={`Candidate Leads (${candidateLeads.length})`}
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
                    data={candidateLeads}
                    className={styles.candidateLeadsList}
                    keySelector={leadKeySelector}
                    renderer={LeadListItem}
                    rendererParams={candidateLeadsRendererParams}
                />
            </ModalBody>
            <ModalFooter>
                <DangerConfirmButton
                    onClick={clearCandidateLeads}
                    // TODO: Translate string
                    confirmationMessage="Are you sure you want to clear all candidate leads?"
                >
                    {/* TODO: Translate string */}
                    Clear All
                </DangerConfirmButton>
                <PrimaryButton
                    disabled={isInProgress}
                    onClick={handleLeadsAdd}
                >
                    {/* TODO: Translate string */}
                    Load
                </PrimaryButton>
            </ModalFooter>
        </Modal>
    );
}

CandidateLeadsModal.propTypes = propTypes;
CandidateLeadsModal.defaultProps = defaultProps;

export default CandidateLeadsModal;
