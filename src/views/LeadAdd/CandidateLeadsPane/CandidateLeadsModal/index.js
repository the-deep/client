import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

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

import { CandidateLeadsManagerContext } from '../../CandidateLeadsManager';
import { leadKeySelector } from '../../utils';
import ListStatusItem from '../../ListStatusItem';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    pending: PropTypes.bool,
    actionDisabled: PropTypes.bool,
    onLoad: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
    onClose: undefined,
    pending: false,
    actionDisabled: false,
};

function CandidateLeadsModal(props) {
    const {
        className,
        pending,
        actionDisabled,
        onClose,
        onLoad,
    } = props;

    const {
        clearCandidateLeads,
        candidateLeads,
        removeCandidateLead,
    } = useContext(CandidateLeadsManagerContext);

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

    return (
        <Modal
            className={_cs(className, styles.candidateLeads)}
            closeOnEscape
            onClose={onClose}
        >
            <ModalHeader
                // TODO: Translate string
                title={`Processing ${candidateLeads.length} lead(s)`}
                rightComponent={(
                    <DangerButton
                        iconName="contractContent"
                        onClick={onClose}
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
                    // TODO: show states (upload, extraction, etc) with better progress
                    renderer={ListStatusItem}
                    rendererParams={candidateLeadsRendererParams}
                />
            </ModalBody>
            <ModalFooter>
                <DangerConfirmButton
                    onClick={clearCandidateLeads}
                    disabled={actionDisabled || pending}
                    // TODO: Translate string
                    confirmationMessage="Are you sure you want to clear all candidate leads?"
                >
                    {/* TODO: Translate string */}
                    Clear All
                </DangerConfirmButton>
                <PrimaryButton
                    disabled={actionDisabled || pending}
                    onClick={onLoad}
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
