import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    caseInsensitiveSubmatch,
} from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';

import {
    leadKeySelector,
    leadFaramValuesSelector,
    leadSourceTypeSelector,
    LEAD_STATUS,
    LEAD_FILTER_STATUS,
} from '../utils';

import LeadListItem from './LeadListItem';
import styles from './styles.scss';

function statusMatches(leadState, filterStatus) {
    switch (filterStatus) {
        case LEAD_FILTER_STATUS.invalid:
            return (
                leadState === LEAD_STATUS.invalid ||
                leadState === LEAD_STATUS.warning
            );
        case LEAD_FILTER_STATUS.saved:
            return leadState === LEAD_STATUS.complete;
        case LEAD_FILTER_STATUS.unsaved:
            return (
                leadState === LEAD_STATUS.nonPristine ||
                leadState === LEAD_STATUS.uploading ||
                leadState === LEAD_STATUS.requesting
            );
        default:
            return false;
    }
}


function leadFilterMethod(lead, filters, leadState) {
    // NOTE: removed filter by publisher
    const {
        search,
        type,
        // source,
        status,
    } = filters;

    const leadType = leadSourceTypeSelector(lead);
    const {
        title: leadTitle = '',
        // source: leadSource = '',
    } = leadFaramValuesSelector(lead);

    if (search && !caseInsensitiveSubmatch(leadTitle, search)) {
        return false;
    // } else if (source && !caseInsensitiveSubmatch(leadSource, source)) {
    //     return false;
    } else if (type && type.length > 0 && type.indexOf(leadType) === -1) {
        return false;
    } else if (status && status.length > 0 && !statusMatches(leadState, status)) {
        return false;
    }
    return true;
}


const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    leads: PropTypes.array.isRequired,
    activeLeadKey: PropTypes.string,
    onLeadSelect: PropTypes.func.isRequired,
    onLeadRemove: PropTypes.func.isRequired,
    onLeadExport: PropTypes.func.isRequired,
    onLeadSave: PropTypes.func.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    leadStates: PropTypes.object.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    leadFilters: PropTypes.object,

    // eslint-disable-next-line react/forbid-prop-types
    fileUploadStatuses: PropTypes.object.isRequired,
};

const defaultProps = {
    activeLeadKey: undefined,
    leadFilters: {},
};

class LeadList extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    // local
    getFilteredLeads = memoize((leads, leadFilters, leadStates) => (
        leads.filter(
            (lead) => {
                const key = leadKeySelector(leads);
                const leadState = leadStates[key];
                return leadFilterMethod(lead, leadFilters, leadState);
            },
        )
    ))

    rendererParams = (key, lead) => {
        const {
            activeLeadKey,
            onLeadSelect,
            onLeadRemove,
            onLeadExport,
            onLeadSave,
            leadStates,
            fileUploadStatuses,
        } = this.props;

        return {
            active: key === activeLeadKey,
            lead,
            onLeadSelect,
            onLeadRemove,
            onLeadExport,
            onLeadSave,

            leadState: leadStates[key],
            progress: fileUploadStatuses[key] ? fileUploadStatuses[key].progress : undefined,
        };
    }

    render() {
        const {
            leads,
            leadFilters,
            leadStates,
        } = this.props;

        const filteredLeads = this.getFilteredLeads(
            leads,
            leadFilters,
            leadStates,
        );

        return (
            <React.Fragment>
                <ListView
                    className={styles.leadList}
                    data={filteredLeads}
                    keySelector={leadKeySelector}
                    renderer={LeadListItem}
                    rendererParams={this.rendererParams}
                />
            </React.Fragment>
        );
    }
}

export default LeadList;
