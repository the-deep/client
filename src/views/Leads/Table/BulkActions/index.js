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
                projectSelectedLeads,
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
                onRemoveItems(projectSelectedLeads);
            }
        },
        onFailure: notifyOnFailure(_ts('leads', 'leads')),
        onFatal: notifyOnFatal(_ts('leads', 'leads')),
    },
};

const BulkActions = (props) => {
    const {
        projectSelectedLeads,
        requests: {
            bulkLeadDeleteRequest,
        },
        activeProject,
        onRemoveItems,
    } = props;

    const entriesCount = useMemo(() => {
        if (projectSelectedLeads.length <= 0) {
            return 0;
        }

        const entries = projectSelectedLeads.map(lead => lead.noOfEntries);
        return sum(entries);
    }, [projectSelectedLeads]);

    const assessmentsCount = useMemo(
        () => {
            if (projectSelectedLeads.length <= 0) {
                return 0;
            }

            const assessments = projectSelectedLeads.map(
                lead => Number(isDefined(lead.assessmentId)),
            );
            return sum(assessments);
        }, [projectSelectedLeads],
    );

    const projectSelectedLeadsIds = useMemo(
        () => projectSelectedLeads.map(lead => lead.id),
        [projectSelectedLeads],
    );

    const onRemoveBulkLead = useCallback(() => {
        bulkLeadDeleteRequest.do({
            project: activeProject,
            leadIds: projectSelectedLeadsIds,
            onRemoveItems,
            projectSelectedLeads,
        });
    }, [
        bulkLeadDeleteRequest,
        projectSelectedLeadsIds,
        activeProject,
        onRemoveItems,
        projectSelectedLeads,
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
                DELETE
            </DangerConfirmButton>
            <PrimaryButton
                onClick={() => console.log('BULK UPDATE')}
            >
                {/* TODO: Bulk update logic */}
                BULK UPDATE
            </PrimaryButton>

            <ModalButton
                tabIndex="-1"
                title={_ts('leads', 'exportToOtherProjectsButtonTitle')}
                iconName="openLink"
                modal={
                    <LeadCopyModal leads={projectSelectedLeadsIds} />
                }
            >
                EXPORT TO OTHER PROJECTS
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
    projectSelectedLeads: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeProject: PropTypes.number.isRequired,
    onRemoveItems: PropTypes.func.isRequired,
};
