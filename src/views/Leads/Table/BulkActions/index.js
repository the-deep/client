import PropTypes from 'prop-types';
import React, { useMemo, useCallback } from 'react';
import { connect } from 'react-redux';

import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
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
        url: '/leads/bulk-delete/',
        method: methods.POST,
        body: ({ params: {
            project,
            leadIds,
        } }) => ({
            project,
            ids: leadIds.join(','), // For comma separated ids
        }),
        onSuccess: ({
            props: {
                removeBulkLead,
            },
            params: {
                leadIds,
                onRemoveItems,
                selectedLeads,
            },
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
        requests: {
            bulkLeadDeleteRequest,
        },
        activeProject,
        onRemoveItems,
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
            onRemoveItems,
            selectedLeads,
        });
    }, [
        bulkLeadDeleteRequest,
        selectedLeadsIds,
        activeProject,
        onRemoveItems,
        selectedLeads,
    ]);

    return (
        <div>
            <DangerConfirmButton
                tabIndex="-1"
                title={_ts('leads', 'removeLeadLeadButtonTitle')}
                onClick={onRemoveBulkLead}
                confirmationMessage={_ts('leads', 'removeMultipleLeadsConfirm', {
                    entriesCount,
                    assessmentsCount,
                })}
            >
                {_ts('leads', 'bulkDeleteButtonText')}
            </DangerConfirmButton>
            {/* TODO: BULK UPDATE LOGIC
            <PrimaryButton
                onClick={() => console.log('BULK UPDATE')}
            >
                BULK UPDATE
            </PrimaryButton> */}

            <ModalButton
                tabIndex="-1"
                title={_ts('leads', 'exportToOtherProjectsButtonTitle')}
                iconName="openLink"
                modal={
                    <LeadCopyModal leads={selectedLeadsIds} />
                }
            >
                {_ts('leads', 'exportToOtherProjectsButtonTitle')}
            </ModalButton>
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
    onRemoveItems: PropTypes.func.isRequired,
};
