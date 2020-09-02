import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';

import { LeadProcessorContext } from '../LeadProcessor';
import ProcessingLeadsModal from './ProcessingLeadsModal';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onLeadsAdd: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
};

function ProcessingLeads(props) {
    const {
        className,
        onLeadsAdd,
    } = props;

    const {
        processingLeads,
        showProcessingModal,
        setProcessingModalVisibility,
    } = useContext(LeadProcessorContext);

    const handleProcessingModalShow = useCallback(() => {
        setProcessingModalVisibility(true);
    }, [setProcessingModalVisibility]);

    const handleProcessingModalClose = useCallback(() => {
        setProcessingModalVisibility(false);
    }, [setProcessingModalVisibility]);

    if (processingLeads.length < 1) {
        return null;
    }

    return (
        <div className={_cs(className, styles.processingLeads)}>
            <div className={styles.header}>
                <h3 className={styles.heading}>
                    {`Processing Leads (${processingLeads.length})`}
                </h3>
                <Button
                    className={styles.expandButton}
                    onClick={handleProcessingModalShow}
                    iconName="expand"
                    transparent
                />
                {showProcessingModal && (
                    <ProcessingLeadsModal
                        onLeadsAdd={onLeadsAdd}
                        closeModal={handleProcessingModalClose}
                    />
                )}
            </div>
        </div>
    );
}

ProcessingLeads.propTypes = propTypes;
ProcessingLeads.defaultProps = defaultProps;

export default ProcessingLeads;
