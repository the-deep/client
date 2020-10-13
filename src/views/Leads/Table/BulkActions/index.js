import PropTypes from 'prop-types';
import React, { useMemo, useCallback } from 'react';
import { connect } from 'react-redux';

import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import _ts from '#ts';
import {
    isDefined,
    sum,
} from '@togglecorp/fujs';

import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';

import {
    RequestClient,
    methods,
} from '#request';

import {
    leadsForProjectTableViewSelector,
    patchLeadAction,
    removeBulkLeadAction,
} from '#redux';

import notify from '#notify';
import LeadCopyModal from '#components/general/LeadCopyModal';

import styles from './styles.scss';

const ModalButton = modalize(Button);

const mapStateToProps = state => ({
    leads: leadsForProjectTableViewSelector(state),
});

const mapDispatchToProps = dispatch => ({
    patchLead: params => dispatch(patchLeadAction(params)),
    removeBulkLead: params => dispatch(removeBulkLeadAction(params)),
});

const requestOptions = {
    bulkLeadDeleteRequest: {
        url: ({ params: { project } }) => `/project/${project}/leads/bulk-delete/`,
        method: methods.POST,
        body: ({ params: { leadIds } }) => ({ leads: leadIds }),
        onSuccess: ({
            props: {
                onRemoveItems,
                selectedLeads,
                removeBulkLead,
            },
            params: { leadIds },
        }) => {
            if (removeBulkLead) {
                removeBulkLead(leadIds);

                notify.send({
                    title: _ts('leads', 'bulkDeleteTitle'),
                    type: notify.type.SUCCESS,
                    message: 'Leads successfully deleted.',
                    duration: notify.duration.MEDIUM,
                });
                onRemoveItems(selectedLeads);
            }
        },
        onFailure: notifyOnFailure(_ts('leads', 'leads')),
        onFatal: notifyOnFatal(_ts('leads', 'leads')),
    },
};

const BulkActions = (props) => {
    const {
        selectedLeads,
        onClearSelection,
        requests: {
            bulkLeadDeleteRequest,
        },
        activeProject,
    } = props;

    const entriesCount = useMemo(() => {
        if (selectedLeads.length <= 0) {
            return 0;
        }

        const entries = selectedLeads.map(lead => lead.noOfEntries);
        return sum(entries);
    }, [selectedLeads]);

    const assessmentsCount = useMemo(
        () => {
            if (selectedLeads.length <= 0) {
                return 0;
            }

            const assessments = selectedLeads.map(
                lead => Number(isDefined(lead.assessmentId)),
            );
            return sum(assessments);
        }, [selectedLeads],
    );

    const selectedLeadsIds = useMemo(
        () => selectedLeads.map(lead => lead.id),
        [selectedLeads],
    );

    const onRemoveBulkLead = useCallback(() => {
        bulkLeadDeleteRequest.do({
            project: activeProject,
            leadIds: selectedLeadsIds,
        });
    }, [
        bulkLeadDeleteRequest,
        selectedLeadsIds,
        activeProject,
    ]);

    return (
        <div className={styles.bulkActionsBar}>
            <span className={styles.text}>
                {_ts('leads', 'selectedLeadsCount', { count: selectedLeads.length })}
            </span>
            <Button
                title={_ts('leads', 'clearSelectedLeadsTitle')}
                iconName="close"
                onClick={onClearSelection}
                className={styles.button}
            >
                {_ts('leads', 'clearSelectionButtonTitle')}
            </Button>
            {/* TODO: BULK UPDATE LOGIC
            <PrimaryButton
                onClick={() => console.log('BULK UPDATE')}
            >
                BULK UPDATE
            </PrimaryButton> */}
            <ModalButton
                tabIndex="-1"
                title={_ts('leads', 'exportToOtherProjectsButtonTitle')}
                className={styles.button}
                iconName="openLink"
                modal={
                    <LeadCopyModal
                        leads={selectedLeadsIds}
                        onSuccess={onClearSelection}
                    />
                }
            >
                {_ts('leads', 'exportToOtherProjectsButtonLabel')}
            </ModalButton>
            <DangerConfirmButton
                tabIndex="-1"
                title={_ts('leads', 'removeLeadLeadButtonTitle')}
                onClick={onRemoveBulkLead}
                iconName="delete"
                className={styles.button}
                confirmationMessage={_ts('leads', 'removeMultipleLeadsConfirm', {
                    leadsCount: selectedLeads.length,
                    entriesCount,
                    assessmentsCount,
                })}
            >
                {_ts('leads', 'bulkDeleteButtonText')}
            </DangerConfirmButton>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(
    RequestClient(requestOptions)(
        BulkActions,
    ),
);


BulkActions.propTypes = {
    selectedLeads: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeProject: PropTypes.number.isRequired,
    onRemoveItems: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onClearSelection: PropTypes.func.isRequired,
};
