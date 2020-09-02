import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';

import { LeadProcessorContext } from '../LeadProcessor';
import CandidateLeadsModal from './CandidateLeadsModal';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onLeadsAdd: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
};

function CandidateLeads(props) {
    const {
        className,
        onLeadsAdd,
    } = props;

    const {
        candidateLeads,
        showProcessingModal,
        setProcessingModalVisibility,
    } = useContext(LeadProcessorContext);

    const handleProcessingModalShow = useCallback(() => {
        setProcessingModalVisibility(true);
    }, [setProcessingModalVisibility]);

    const handleProcessingModalClose = useCallback(() => {
        setProcessingModalVisibility(false);
    }, [setProcessingModalVisibility]);

    if (candidateLeads.length < 1) {
        return null;
    }

    return (
        <div className={_cs(className, styles.candidateLeads)}>
            <div className={styles.header}>
                <h3 className={styles.heading}>
                    {`Candidate Leads (${candidateLeads.length})`}
                </h3>
                <Button
                    className={styles.expandButton}
                    onClick={handleProcessingModalShow}
                    iconName="expand"
                    transparent
                />
                {showProcessingModal && (
                    <CandidateLeadsModal
                        onLeadsAdd={onLeadsAdd}
                        closeModal={handleProcessingModalClose}
                    />
                )}
            </div>
        </div>
    );
}

CandidateLeads.propTypes = propTypes;
CandidateLeads.defaultProps = defaultProps;

export default CandidateLeads;
