import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { detachedFaram } from '@togglecorp/faram';
import {
    isDefined,
    unique,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import { LeadFormRaw as LeadForm } from '#views/LeadAdd/LeadDetail/LeadForm';
import schema from '#views/LeadAdd/LeadDetail/LeadForm/faramSchema';
import {
    leadFaramValuesSelector,
} from '#views/LeadAdd/utils';

import {
    patchLeadAction,
    currentUserActiveProjectSelector,
    projectIdFromRouteSelector,
} from '#redux';

import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';

import useRequest from '#restrequest';

import notify from '#notify';
import _ts from '#ts';

import styles from './styles.scss';

function mergeEntities(foo = [], bar = []) {
    return unique(
        [...foo, ...bar],
        item => item.id,
    );
}

const propTypes = {
    leadId: PropTypes.number.isRequired,
    activeProject: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    closeModal: PropTypes.func,
    patchLead: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
};

const defaultProps = {
    closeModal: undefined,
};

function LeadEditModal(props) {
    const {
        leadId,
        lead: leadFromProps,
        closeModal,
        patchLead,
        projectId,
        activeProject,
    } = props;

    const [leadFaramValues, setLeadFaramValues] = useState(leadFromProps);
    const [leadFaramValuesForServer, setLeadFaramValuesForServer] = useState(undefined);
    const [leadFaramErrors, setLeadFaramErrors] = useState({});
    const [pristine, setPristine] = useState(true);

    const [pending,,, onLeadEdit] = useRequest({
        url: `server://v2/leads/${leadId}/`,
        method: 'PUT',
        body: leadFaramValuesForServer,
        onSuccess: (response) => {
            const lead = response;
            patchLead({ lead });
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
        onFailure: (error, errorBody) => {
            notifyOnFailure(_ts('leads', 'leads'))({ error: errorBody });
        },
    });

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
            onValidationFailure: (faramErrors) => {
                setLeadFaramErrors(faramErrors);
            },
            onValidationSuccess: (faramValues) => {
                setLeadFaramValuesForServer(faramValues);
                onLeadEdit();
            },
        });
    }, [
        leadFaramValues,
        onLeadEdit,
    ]);

    const lead = useMemo(() => ({
        faramValues: leadFaramValues,
        faramErrors: leadFaramErrors,
    }), [leadFaramValues, leadFaramErrors]);

    const isSubmitDisabled = useMemo(() => (
        !doesObjectHaveNoData(leadFaramErrors) || pristine
    ), [pristine, leadFaramErrors]);


    const [organizations, setOrganizations] = useState([]);
    const [leadGroups, setLeadGroups] = useState([]);

    const mergeOrganizations = useCallback(
        (newOrganizations) => {
            setOrganizations(stateOrganizations => (
                mergeEntities(stateOrganizations, newOrganizations)
            ));
        },
        [],
    );

    const body = useMemo(
        () => {
            const values = [lead].map(leadFaramValuesSelector);
            const leadSources = values.map(item => item.source).filter(isDefined);
            const leadAuthors = values.map(item => item.authors).filter(isDefined).flat();
            return {
                projects: [projectId],
                organizations: unique([...leadSources, ...leadAuthors], id => id),
            };
        },
        // NOTE: only re-calculate when project id changes
        [projectId],
    );

    const [pendingLeadOptions, leadOptions] = useRequest({
        url: 'server://lead-options/',
        method: 'POST',
        body,
        autoTrigger: true,
        onSuccess: (response) => {
            setOrganizations(response.organizations);
            setLeadGroups(response.leadGroups);
        },
        onFailure: () => {
            setOrganizations([]);
            setLeadGroups([]);
        },
    });

    const handleOrganizationsAdd = useCallback(
        (newOrganizations) => {
            if (newOrganizations.length <= 0) {
                return;
            }
            mergeOrganizations(newOrganizations);
        },
        [mergeOrganizations],
    );

    const handleLeadGroupsAdd = useCallback(
        (newLeadGroups) => {
            if (newLeadGroups.length <= 0) {
                return;
            }
            setLeadGroups(stateLeadGroups => (
                mergeEntities(stateLeadGroups, newLeadGroups)
            ));
        },
        [],
    );
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
                <LeadForm
                    lead={lead}
                    leadState={undefined}
                    bulkActionDisabled
                    pending={pending || pendingLeadOptions}
                    onChange={handleLeadDetailChange}

                    priorityOptions={leadOptions?.priority}
                    confidentialityOptions={leadOptions?.confidentiality} // eslint-disable-line max-len
                    assignees={leadOptions?.members}

                    leadGroups={leadGroups}
                    organizations={organizations}

                    onLeadGroupsAdd={handleLeadGroupsAdd}
                    onOrganizationsAdd={handleOrganizationsAdd}

                    activeProject={activeProject}
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
                    pending={pending || pendingLeadOptions}
                >
                    {_ts('leads', 'saveLeadEditButtonLabel')}
                </PrimaryButton>
            </ModalFooter>
        </Modal>
    );
}
LeadEditModal.propTypes = propTypes;
LeadEditModal.defaultProps = defaultProps;

const mapStateToProps = state => ({
    activeProject: currentUserActiveProjectSelector(state),
    projectId: projectIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    patchLead: params => dispatch(patchLeadAction(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(
    LeadEditModal,
);
