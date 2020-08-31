import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';
import modalize from '#rscg/Modalize';

import { LeadProcessorContext } from '../LeadProcessor';
import ProcessingLeadsModal from './ProcessingLeadsModal';

import styles from './styles.scss';

const ModalButton = modalize(Button);

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
    const { processingLeads } = useContext(LeadProcessorContext);

    return (
        <div className={_cs(className, styles.processingLeads)}>
            <div className={styles.header}>
                <h3 className={styles.heading}>
                    {`Processing Leads (${processingLeads.length})`}
                </h3>
                <ModalButton
                    className={styles.expandButton}
                    iconName="expand"
                    transparent
                    modal={(
                        <ProcessingLeadsModal
                            onLeadsAdd={onLeadsAdd}
                        />
                    )}
                />
            </div>
        </div>
    );
}

ProcessingLeads.propTypes = propTypes;
ProcessingLeads.defaultProps = defaultProps;

export default ProcessingLeads;
