import PropTypes from 'prop-types';
import React, { useMemo, useCallback } from 'react';
import { connect } from 'react-redux';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import _ts from '#ts';
import {
    isDefined,
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
            },
        }) => {
            if (removeBulkLead) {
                removeBulkLead(leadIds);

                notify.send({
                    title: 'Bulk Delete Leads',
                    type: notify.type.SUCCESS,
                    message: 'Leads successfully deleted.',
                    duration: notify.duration.MEDIUM,
                });
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
    } = props;

    const entriesCount = useMemo(() => {
        if (selectedLeads.length <= 0) {
            return 0;
        }
        const totalNoOfEntries = selectedLeads.reduce((accum, lead) => accum + lead.noOfEntries, 0);
        return totalNoOfEntries;
    }, [selectedLeads]);

    const assessmentsCount = useMemo(
        () => {
            if (selectedLeads.length <= 0) {
                return 0;
            }
            const totalNoOfAssessments = selectedLeads.reduce(
                (accum, lead) => accum + Number(isDefined(lead.assessmentId)), 0,
            );
            return totalNoOfAssessments;
        }, [selectedLeads],
    );

    const selectedLeadsIds = useMemo(
        () => selectedLeads.map(lead => lead.id), [selectedLeads],
    );

    const onRemoveBulkLead = useCallback(() => {
        bulkLeadDeleteRequest.do({
            project: activeProject,
            leadIds: selectedLeadsIds,
        });
    }, [bulkLeadDeleteRequest, selectedLeadsIds, activeProject]);

    const confirmationMessage = `
        Are you sure you want to remove the selected leads?
        The leads along with associated ${entriesCount} entries and 
        ${assessmentsCount} assessment will be removed.`;

    return (
        <div>
            <DangerConfirmButton
                tabIndex="-1"
                title={_ts('leads', 'removeLeadLeadButtonTitle')}
                onClick={onRemoveBulkLead}
                confirmationMessage={confirmationMessage}
            >
                DELETE
            </DangerConfirmButton>
            <PrimaryButton
                onClick={() => console.log('BULK UPDATE')}
            >
                {/* FIXME: use strings */}
                BULK UPDATE
            </PrimaryButton>
            <PrimaryButton onClick={() => console.log('EXPORT TO OTHER PROJECTS')} >
                {/* FIXME: use strings */}
                EXPORT TO OTHER PROJECTS
            </PrimaryButton>
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
};
