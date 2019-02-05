import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import LeftPanelOriginal from '#components/leftpanel';
import SelectInput from '#rsci/SelectInput';

import { activeProjectRoleSelector } from '#redux';
import _ts from '#ts';

import EntriesListing from './EntriesListing';
import styles from './styles.scss';

const propTypes = {
    projectRole: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    lead: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    leadGroup: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    activeSector: PropTypes.string,
};

const defaultProps = {
    projectRole: {},
    activeSector: undefined,
    lead: undefined,
    leadGroup: undefined,
};

const mapStateToProps = state => ({
    projectRole: activeProjectRoleSelector(state),
});

@connect(mapStateToProps)
export default class LeftPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = lead => lead.id;
    static labelSelector = lead => lead.title;

    constructor(props) {
        super(props);

        const {
            leadGroup,
            lead,
        } = this.props;

        const leads = this.getLeads(lead, leadGroup);
        const firstLead = leads && leads.length > 0 && leads[0];

        this.state = {
            currentLeadId: firstLead && firstLead.id,
        };
    }

    getLeads = memoize((lead, leadGroup) => (
        (lead && [lead]) || (leadGroup && leadGroup)
    ))

    getViews = className => ({
        'entries-listing': {
            component: EntriesListing,
            rendererParams: () => {
                const { activeSector } = this.props;
                const { currentLeadId } = this.state;
                return {
                    className,
                    leadId: currentLeadId,
                    activeSector,
                };
            },
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
    })

    getTabs = memoize(tabs => ({
        ...tabs,
        'entries-listing': _ts('editEntry.overview.leftpane', 'entriesTabLabel'),
    }))

    handleLeadSelectChange = (id) => {
        this.setState({ currentLeadId: id });
    };

    render() {
        const {
            projectRole,
            lead: leadFromProps,
            leadGroup,
        } = this.props;
        const { currentLeadId } = this.state;

        const leads = this.getLeads(leadFromProps, leadGroup);
        const lead = leads.find(l => l.id === currentLeadId);

        return (
            <Fragment>
                <SelectInput
                    hideClearButton
                    className={styles.leadSelectInput}
                    showLabel={false}
                    showHintAndError={false}
                    options={leads}
                    onChange={this.handleLeadSelectChange}
                    value={currentLeadId}
                    keySelector={LeftPanel.keySelector}
                    labelSelector={LeftPanel.labelSelector}
                />
                <LeftPanelOriginal
                    projectRole={projectRole}
                    lead={lead}
                    viewsModifier={this.getViews}
                    tabsModifier={this.getTabs}
                    // onExcerptCreate={onExcerptCreate}
                    // filteredEntries={filteredEntries}
                    // setSelectedEntryKey={setSelectedEntryKey}
                />
            </Fragment>
        );
    }
}
