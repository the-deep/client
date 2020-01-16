import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import LeftPanelOriginal from '#components/leftpanel';
import SelectInput from '#rsci/SelectInput';

import _ts from '#ts';
import _cs from '#cs';

import EntriesListing from './EntriesListing';
import styles from './styles.scss';

const propTypes = {
    lead: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    leadGroup: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    activeSector: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    className: undefined,
    activeSector: undefined,
    lead: undefined,
    leadGroup: undefined,
};

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
        (lead && [lead]) || (leadGroup && leadGroup.leads)
    ))

    getViews = className => ({
        'entries-listing': {
            component: EntriesListing,
            rendererParams: () => {
                const { activeSector } = this.props;
                const { currentLeadId } = this.state;
                return {
                    className: _cs(styles.entries, className),
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
            lead: leadFromProps,
            leadGroup,
            className,
        } = this.props;
        const { currentLeadId } = this.state;

        const leads = this.getLeads(leadFromProps, leadGroup);
        const lead = leads.find(l => l.id === currentLeadId);

        return (
            <div className={_cs(className, styles.leftPanel)}>
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
                <div className={styles.container}>
                    <LeftPanelOriginal
                        className={styles.leftPanel}
                        lead={lead}
                        viewsModifier={this.getViews}
                        tabsModifier={this.getTabs}
                    />
                </div>
            </div>
        );
    }
}
