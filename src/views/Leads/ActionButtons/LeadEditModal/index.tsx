import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import Button from '#rsca/Button';

import LeadDetail from '#views/LeadAdd/LeadDetail';

import styles from './styles.scss';

interface LeadFaramValues {
    id: number;
}

interface LeadFaramErrors {
}

interface Lead {
    faramValues: LeadFaramValues;
    faramErrors: LeadFaramErrors;
}

interface Props {
    activeProject?: number;
    lead: LeadFaramValues;
}

function LeadEditModal(props: Props) {
    const {
        lead: leadFromProps,
        activeProject,
    } = props;

    const [lead, setLead] = useState<Lead>(() => ({
        faramValues: leadFromProps,
        faramErrors: {},
    }));

    return (
        <Modal
            className={styles.modal}
            closeOnEscape
        >
            <ModalBody
                className={styles.modalBody}
            >
                <LeadDetail
                    lead={lead}
                    // onChange={setLead}
                    bulkActionDisabled
                    onChange={setLead}
                    disableLeadIdentity
                    hideProjects
                />
            </ModalBody>
        </Modal>
    );
}

export default LeadEditModal;
