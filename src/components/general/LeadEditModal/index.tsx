import React, { useState, useCallback, useMemo } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { doesObjectHaveNoData } from '@togglecorp/fujs';
import { detachedFaram } from '@togglecorp/faram';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import LoadingAnimation from '#rscv/LoadingAnimation';

import LeadDetail from '#views/LeadAdd/LeadDetail';
import schema from '#views/LeadAdd/LeadDetail/faramSchema';

import { patchLeadAction } from '#redux';
import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';

import {
    AddRequestProps,
    Requests,
    Lead as LeadFaramValues,
} from '#types';

import {
    RequestClient,
    methods,
} from '#request';

import notify from '#notify';
import _ts from '#ts';

import styles from './styles.scss';

interface LeadFaramErrors {}

interface OwnProps {
    leadId: number;
    lead: LeadFaramValues;
    closeModal: () => void;
    onSave?: (lead: LeadFaramValues) => void;
}

interface PropsFromDispatch {
    patchLead?: typeof patchLeadAction;
}

interface Params {
    leadId?: number;
    body?: LeadFaramValues;
}

const requestOptions: Requests<OwnProps & PropsFromDispatch, Params> = {
    leadEditRequest: {
        url: ({ params }) => `/v2/leads/${params && params.leadId}/`,
        body: ({ params }) => params && params.body,
        method: methods.PUT,
        onSuccess: ({ response, props }) => {
            const lead = response as LeadFaramValues;
            const {
                patchLead,
                closeModal,
                onSave,
            } = props;

            if (onSave) {
                onSave(lead);
            }
            if (patchLead) {
                patchLead({ lead });
            }
            notify.send({
                type: notify.type.SUCCESS,
                title: _ts('leads', 'leads'),
                message: _ts('leads', 'leadEditedSuccessfullyMessage'),
                duration: notify.duration.FAST,
            });
            if (closeModal) {
                closeModal();
            }
        },
        onFailure: notifyOnFailure(_ts('leads', 'leads')),
        onFatal: notifyOnFatal(_ts('leads', 'leads')),
    },
};

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    patchLead: params => dispatch(patchLeadAction(params)),
});

type Props = AddRequestProps<OwnProps & PropsFromDispatch, Params>;

function LeadEdit(props: Props) {
    const {
        leadId,
        lead: leadFromProps,
        closeModal,
        requests: {
            leadEditRequest: {
                do: onLeadEdit,
                pending,
            },
        },
    } = props;

    const [leadFaramValues, setLeadFaramValues] = useState<LeadFaramValues>(leadFromProps);
    const [leadFaramErrors, setLeadFaramErrors] = useState<LeadFaramErrors>({});
    const [pristine, setPristine] = useState<LeadFaramErrors>(true);

    const handleLeadDetailChange = useCallback(({
        faramValues: newFaramValues,
        faramErrors: newFaramErrors,
    }) => {
        setLeadFaramValues(newFaramValues);
        setLeadFaramErrors(newFaramErrors);
        setPristine(false);
    }, [setLeadFaramValues, setLeadFaramErrors, setPristine]);

    const handleFormSubmit = useCallback(() => {
        detachedFaram({
            value: leadFaramValues,
            schema,
            onValidationFailure: (faramErrors: LeadFaramErrors) => {
                setLeadFaramErrors(faramErrors);
            },
            onValidationSuccess: (faramValues: LeadFaramValues) => {
                onLeadEdit({
                    leadId,
                    body: faramValues,
                });
            },
        });
    }, [
        leadFaramValues,
        setLeadFaramErrors,
        onLeadEdit,
        leadId,
    ]);

    const lead = useMemo(() => ({
        faramValues: leadFaramValues,
        faramErrors: leadFaramErrors,
    }), [leadFaramValues, leadFaramErrors]);

    const isSubmitDisabled = useMemo(() => (
        !doesObjectHaveNoData(leadFaramErrors) || pristine
    ), [pristine, leadFaramErrors]);

    return (
        <Modal
            className={styles.modal}
            closeOnEscape
        >
            <ModalHeader
                title={_ts('leads', 'editLeadModalTitle')}
                rightComponent={(
                    <DangerButton
                        onClick={closeModal}
                        transparent
                        iconName="close"
                    />
                )}
            />
            <ModalBody className={styles.modalBody}>
                {pending && <LoadingAnimation />}
                <LeadDetail
                    onChange={handleLeadDetailChange}
                    lead={lead}
                    disableLeadUrlChange
                    bulkActionDisabled
                    hideProjects
                />
            </ModalBody>
            <ModalFooter>
                <DangerButton
                    onClick={closeModal}
                >
                    {_ts('leads', 'cancelLeadEditButtonLabel')}
                </DangerButton>
                <PrimaryButton
                    disabled={isSubmitDisabled}
                    onClick={handleFormSubmit}
                    pending={pending}
                >
                    {_ts('leads', 'saveLeadEditButtonLabel')}
                </PrimaryButton>
            </ModalFooter>
        </Modal>
    );
}

export default connect(undefined, mapDispatchToProps)(
    (RequestClient(requestOptions)(LeadEdit)),
);

export const LeadEditModal = RequestClient(requestOptions)(LeadEdit);
