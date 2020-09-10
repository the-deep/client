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
        clearCompletedCandidateLeads,
        clearCandidateLeads,
        candidateLeads,
        removeCandidateLead,
    } = useContext(LeadProcessorContext);

    const candidateLeadsRendererParams = useCallback((key, candidateLead) => {
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
            title: candidateLead.data?.title,
            type: candidateLead.data.sourceType,
            progress: candidateLead.progress,
            actionButtons,
            itemState: candidateLead.leadState,
        });
    }, [removeCandidateLead]);

    const isInProgress = useMemo(() => (
        candidateLeads.some(candidateLead => (
            candidateLead.leadState === LEAD_STATUS.pristine
            || candidateLead.leadState === LEAD_STATUS.uploading
        ))
    ), [candidateLeads]);

    const handleLeadsAdd = useCallback(() => {
        // TODO: filter only completed leads
        const newLeads = candidateLeads
            .filter(candidateLead => candidateLead.leadState === LEAD_STATUS.complete)
            .map(candidateLead => ({
                faramValues: candidateLead.data,
                // FIXME: serverId is not required
                serverId: candidateLeads.serverId,
            }));
        onLeadsAdd(newLeads);
        // TODO: Only remove completed leads
        clearCompletedCandidateLeads();
        closeModal();
    }, [
        candidateLeads,
        onLeadsAdd,
        clearCompletedCandidateLeads,
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
                    disabled={isInProgress}
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
