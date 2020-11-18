import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import ResizableV from '#rscv/Resizable/ResizableV';

import LeadForm from './LeadForm';
import LeadPreviewWithTabular from './LeadPreviewWithTabular';

import {
    LEAD_TYPE,
    leadKeySelector,
    leadSourceTypeSelector,
} from '../utils';
import styles from './styles.scss';

function LeadDetail(props) {
    const {
        activeLead,
        leadPreviewHidden,
        leadStates,
        leadDuplicates,
        bulkActionDisabled, // subitAllPending
        pending,
        leadOptions,
        onLeadGroupsAdd,
        onOrganizationsAdd,
        leadGroups,
        organizations,
    } = props;

    const leadIsTextType = leadSourceTypeSelector(activeLead) === LEAD_TYPE.text;
    const activeLeadKey = activeLead
        ? leadKeySelector(activeLead)
        : undefined;
    const activeLeadState = activeLeadKey
        ? leadStates[activeLeadKey]
        : undefined;
    const activeLeadDuplicate = activeLeadKey
        ? leadDuplicates[activeLeadKey]
        : undefined;
    const leadPreviewMinimized = leadPreviewHidden || leadIsTextType;

    return (
        <ResizableV
            className={_cs(
                styles.leadDetail,
                leadPreviewMinimized && styles.textLead,
            )}
            topContainerClassName={styles.top}
            bottomContainerClassName={styles.bottom}
            disabled={leadPreviewMinimized}
            topChild={(
                <LeadForm
                    key={activeLeadKey}
                    lead={activeLead}
                    leadState={activeLeadState}
                    leadDuplicate={activeLeadDuplicate}
                    bulkActionDisabled={bulkActionDisabled}

                    pending={pending}

                    priorityOptions={leadOptions?.priority}
                    confidentialityOptions={leadOptions?.confidentiality} // eslint-disable-line max-len
                    assignees={leadOptions?.members}

                    leadGroups={leadGroups}
                    onLeadGroupsAdd={onLeadGroupsAdd}

                    organizations={organizations}
                    onOrganizationsAdd={onOrganizationsAdd}
                />
            )}
            bottomChild={!leadPreviewMinimized && (
                <LeadPreviewWithTabular
                    // NOTE: need to dismount
                    // LeadPreview because the
                    // children cannot handle
                    // change gracefully
                    key={activeLeadKey}
                    className={styles.leadPreview}
                    lead={activeLead}
                />
            )}
        />
    );
}
LeadDetail.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    activeLead: PropTypes.object.isRequired,
    leadPreviewHidden: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    leadStates: PropTypes.object.isRequired,
    bulkActionDisabled: PropTypes.bool,
    pending: PropTypes.bool,

    // eslint-disable-next-line react/forbid-prop-types
    leadOptions: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    organizations: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    leadGroups: PropTypes.array,

    onLeadGroupsAdd: PropTypes.func.isRequired,
    onOrganizationsAdd: PropTypes.func.isRequired,
};
LeadDetail.defaultProps = {
    leadPreviewHidden: false,
    bulkActionDisabled: false,
    pending: false,
    leadOptions: [],
    organizations: [],
    leadGroups: [],
};

export default LeadDetail;
