import React from 'react';
import PropTypes from 'prop-types';

import ListView from '#rscv/List/ListView';

import { leadKeySelector } from '../utils';

import LeadListItem from './LeadListItem';
import styles from './styles.scss';

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
    fileUploadStatuses: PropTypes.object.isRequired,
};

const defaultProps = {
    activeLeadKey: undefined,
};

class LeadList extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

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
        } = this.props;

        return (
            <React.Fragment>
                <ListView
                    className={styles.leadList}
                    data={leads}
                    keySelector={leadKeySelector}
                    renderer={LeadListItem}
                    rendererParams={this.rendererParams}
                />
            </React.Fragment>
        );
    }
}

export default LeadList;
