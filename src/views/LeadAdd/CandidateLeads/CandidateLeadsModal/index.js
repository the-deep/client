import React, { useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { _cs, listToMap, isDefined, union, isTruthyString } from '@togglecorp/fujs';

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
    LEAD_TYPE,
} from '../../utils';
import LeadListItem from '../../LeadListItem';

import styles from './styles.scss';

function getSourceKey(data) {
    const { sourceType, url, attachment } = data;
    if (sourceType === LEAD_TYPE.website) {
        return data.url;
    }
    if ([LEAD_TYPE.dropbox, LEAD_TYPE.drive, LEAD_TYPE.file].includes(sourceType)) {
        return attachment?.s3 ? `s3::${attachment.s3}` : undefined;
    }
    return undefined;
}
function getSource(data) {
    const { sourceType, url, attachment } = data;
    if (sourceType === LEAD_TYPE.website) {
        return data.url ? { url: data.url } : undefined;
    }
    if ([LEAD_TYPE.dropbox, LEAD_TYPE.drive, LEAD_TYPE.file].includes(sourceType)) {
        return attachment?.s3 ? { s3: attachment.s3 } : undefined;
    }
    return undefined;
}

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
            // TODO: filter already extracted leads
            completedCandidateLeads
                .map(lead => getSource(lead.data))
                .filter(isDefined)
        ),
        [completedCandidateLeads],
    );

    const [extractions, setExtractions] = useState({});

    const organizationsRaw = useMemo(
        () => {
            const extraMetaList = Object.values(extractions)
                .map(extraction => extraction.extraMeta)
                .filter(isDefined);

            const authors = new Set(
                extraMetaList.map(item => item.authorRaw).filter(isTruthyString),
            );
            const publishers = new Set(
                extraMetaList.map(item => item.sourceRaw).filter(isTruthyString),
            );
            const orgs = [...union(authors, publishers)];
            console.log(orgs);
            return orgs;
        },
        [extractions],
    );

    const mergeExtractions = useCallback(
        (ext) => {
            if (!ext) {
                return;
            }

            setExtractions(oldExtractions => ({
                ...oldExtractions,
                ...listToMap(
                    ext,
                    item => (item.url ? item.url : item.key),
                    item => item,
                ),
            }));
        },
        [],
    );

    /*
    const [organizations, setOrganizations] = useState({});
    const [organizationRequestPending,,, organizationRequestTrigger] = useRequest({
        url: 'server://organizations/',
        query: {
            limit: 100,
        },
        // method: 'POST',
        // body,
    });
    */

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
        shouldPoll: (response, run) => {
            if (response.status === 'pending' || response.status === 'started') {
                return 1000 * Math.min(2 ** run, 64);
            }
            return -1;
        },
        onSuccess: (response) => {
            if (response.status === 'success') {
                console.debug('success', response);
                mergeExtractions(response.existingSources);
                // trigger organizations
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
                mergeExtractions(response.existingSources);
            }
            if (response.asyncJobUuid) {
                setAsycJobUuid(response.asyncJobUuid);
                pollRequestTrigger();
            } else {
                // trigger organizations
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
