import React, { useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { _cs, listToMap } from '@togglecorp/fujs';

import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Button from '#rsca/Button';
import ListView from '#rscv/List/ListView';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import useRequest from '#restrequest';

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

    // FIXME: no need to set sources, they can be calculated,
    // use trigger mechanism
    // FIXME: fix autotrigger
    // const [sources, setSources] = useState(undefined);
    const [asyncJobUuid, setAsycJobUuid] = useState();

    const completedCandidateLeads = useMemo(
        () => candidateLeads.filter(
            candidateLead => candidateLead.leadState === LEAD_STATUS.complete,
        ),
        [candidateLeads],
    );

    const isInProgress = useMemo(() => (
        candidateLeads.some(candidateLead => (
            candidateLead.leadState === LEAD_STATUS.pristine
            || candidateLead.leadState === LEAD_STATUS.uploading
        ))
    ), [candidateLeads]);

    const sources = useMemo(
        () => (
            completedCandidateLeads.map(lead => ({
                s3: lead.data.attachment.s3,
            }))
        ),
        [completedCandidateLeads],
    );

    const [extractions, setExtractions] = useState([]);
    const [extractionCompleted, setExtractionCompleted] = useState(false);

    const pollBody = useMemo(
        () => (
            asyncJobUuid ? { asyncJobUuid } : undefined
        ),
        [asyncJobUuid],
    );
    const [pollRequestPending,,, pollRequestTrigger] = useRequest({
        url: 'serverless://source-extract/',
        method: 'POST',
        body: pollBody,
        shouldPoll: (response) => {
            if (response.status === 'pending' || response.status === 'started') {
                return 1000;
            }
            return -1;
        },
        onSuccess: (response) => {
            if (response.status === 'success') {
                console.debug('success', response);
                setExtractions(ex => [...ex, response.existingSources]);
                setExtractionCompleted(true);
            } else {
                console.debug('failed');
            }
        },
        onFailure: () => {
            console.debug('failed');
        },
    });

    const initialBody = useMemo(
        () => (
            sources ? { sources } : undefined
        ),
        [sources],
    );
    const [initialRequestPending,,, initialRequestTrigger] = useRequest({
        url: 'serverless://source-extract/',
        method: 'POST',
        body: initialBody,
        onSuccess: (response) => {
            if (response.existingSources) {
                setExtractions(response.existingSources);
                setExtractionCompleted(!response.asyncJobUuid);
            }
            if (response.asyncJobUuid) {
                setAsycJobUuid(response.asyncJobUuid);
                pollRequestTrigger();
            }
        },
        onFailure: () => {
            console.debug('failed');
        },
    });

    const pending = initialRequestPending || pollRequestPending;

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

    /*
    const handleLeadsAdd = useCallback(() => {
        const newLeads = completedCandidateLeads
            .map(candidateLead => ({
                faramValues: candidateLead.data,
                // FIXME: serverId is not required
                serverId: candidateLead.serverId,
            }));

        onLeadsAdd(newLeads);
        // TODO: Only remove completed leads
        clearCompletedCandidateLeads();
        closeModal();
    }, [
        initialRequestTrigger,
        completedCandidateLeads,
        completedCandidateLeads,
        onLeadsAdd,
        clearCompletedCandidateLeads,
        closeModal,
    ]);
    */

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
                {pending && <LoadingAnimation />}
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
                    disabled={isInProgress || pending}
                    // TODO: Translate string
                    confirmationMessage="Are you sure you want to clear all candidate leads?"
                >
                    {/* TODO: Translate string */}
                    Clear All
                </DangerConfirmButton>
                <PrimaryButton
                    disabled={isInProgress || pending}
                    onClick={initialRequestTrigger}
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
