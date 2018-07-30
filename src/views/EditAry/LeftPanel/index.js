import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import MultiViewContainer from '#rs/components/View/MultiViewContainer';
import Message from '#rs/components/View/Message';
import FixedTabs from '#rs/components/View/FixedTabs';
import SelectInput from '#rsci/SelectInput';
import Label from '#rsci/Label';

import {
    LEAD_TYPE,
    LEAD_PANE_TYPE,
    leadPaneTypeMap,
} from '#entities/lead';
import SimplifiedLeadPreview from '#components/SimplifiedLeadPreview';
import LeadPreview from '#components/LeadPreview';
import AssistedTagging from '#components/AssistedTagging';
import ImagesGrid from '#components/ImagesGrid';
import _ts from '#ts';

import EntriesListing from './EntriesListing';
import styles from './styles.scss';

const propTypes = {
    lead: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    leadGroup: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    activeSector: PropTypes.string,
};

const defaultProps = {
    activeSector: undefined,
    lead: undefined,
    leadGroup: undefined,
};

export default class LeftPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getPaneType = (lead) => {
        if (!lead) {
            return undefined;
        }
        const type = lead.sourceType;
        if (type === LEAD_TYPE.text) {
            return LEAD_PANE_TYPE.text;
        } else if (type === LEAD_TYPE.website) {
            return LEAD_PANE_TYPE.website;
        }
        if (!lead.attachment) {
            return undefined;
        }
        const { mimeType } = lead.attachment;
        return leadPaneTypeMap[mimeType];
    }

    constructor(props) {
        super(props);

        const {
            leadGroup,
            lead,
        } = props;

        let leads = [];

        if (lead) {
            leads = [lead];
        }

        if (leadGroup) {
            leads = leadGroup.leads;
        }

        this.state = {
            images: [],
            currentTab: undefined,
            leads,
            currentLeadId: (leads[0] || {}).id,
        };

        this.leads = leads;
        this.views = this.calculateTabComponents();
    }

    componentWillReceiveProps(nextProps) {
        const {
            leadGroup: oldLeadGroup,
            lead: oldLead,
        } = this.props;

        const {
            leadGroup: newLeadGroup,
            lead: newLead,
        } = nextProps;


        let changed = false;
        let leads;

        if (newLead && newLead !== oldLead) {
            leads = [newLead];
            changed = true;
        }

        if (newLeadGroup && newLeadGroup !== oldLeadGroup) {
            leads = newLeadGroup.leads;
            changed = true;
        }

        if (changed) {
            this.setState({
                leads,
            });
        }
    }

    calculateTabComponents = () => ({
        'simplified-preview': {
            component: () => (
                <SimplifiedLeadPreview
                    className={styles.simplifiedPreview}
                    leadId={this.state.currentLeadId}
                    onLoad={this.handleLoadImages}
                />
            ),
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
        'assisted-tagging': {
            component: () => {
                const {
                    currentLeadId,
                    leads,
                } = this.state;

                const lead = leads.find(d => d.id === currentLeadId);

                return (
                    <AssistedTagging
                        onEntryAdd={() => { /* FIXME: add real function */ }}
                        className={styles.assistedTagging}
                        leadId={currentLeadId}
                        projectId={lead.project}
                    />
                );
            },
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
        'original-preview': {
            component: () => {
                const {
                    currentLeadId,
                    leads,
                } = this.state;

                const lead = leads.find(d => d.id === currentLeadId);
                return (
                    <div className={styles.originalPreview}>
                        <LeadPreview
                            lead={lead}
                            handleScreenshot={this.handleScreenshot}
                        />
                    </div>
                );
            },
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
        'images-preview': {
            component: () => (
                <ImagesGrid
                    className={styles.imagesPreview}
                    images={this.state.images}
                />
            ),
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
        'entries-listing': {
            component: () => (
                <div className={styles.entriesListContainer}>
                    <EntriesListing
                        leadId={this.state.currentLeadId}
                        activeSector={this.props.activeSector}
                    />
                </div>
            ),
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
    })

    calculateTabsForLead = (lead, images) => {
        const leadPaneType = LeftPanel.getPaneType(lead);

        let tabs;
        switch (leadPaneType) {
            case LEAD_PANE_TYPE.spreadsheet:
                tabs = {
                    'original-preview': _ts('editAssessment', 'tabularTabLabel'),
                    'images-preview': _ts('editAssessment', 'imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.image:
                tabs = {
                    'original-preview': _ts('editAssessment', 'imagesTabLabel'),
                    'images-preview': _ts('editAssessment', 'imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.text:
                tabs = {
                    'simplified-preview': _ts('editAssessment', 'simplifiedTabLabel'),
                    'assisted-tagging': _ts('editAssessment', 'assistedTabLabel'),
                    'images-preview': _ts('editAssessment', 'imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.word:
            case LEAD_PANE_TYPE.pdf:
            case LEAD_PANE_TYPE.presentation:
            case LEAD_PANE_TYPE.website:
                tabs = {
                    'simplified-preview': _ts('editAssessment', 'simplifiedTabLabel'),
                    'assisted-tagging': _ts('editAssessment', 'assistedTabLabel'),
                    'original-preview': _ts('editAssessment', 'originalTabLabel'),
                    'images-preview': _ts('editAssessment', 'imagesTabLabel'),
                };
                break;
            default:
                return undefined;
        }
        if (!images || images.length <= 0) {
            tabs['images-preview'] = undefined;
        }
        tabs['entries-listing'] = _ts('editAssessment', 'entriesTabLabel');
        return tabs;
    }

    handleTabClick = (key) => {
        if (key === this.state.currentTab) {
            return;
        }
        this.setState({ currentTab: key });
    }

    // Simplified Lead Preview

    handleLoadImages = (response) => {
        if (response.images) {
            this.setState({ images: response.images });
        }
    }

    // Assisted Tagging

    // Lead Preview

    handleScreenshot = (/* image */) => {
        console.warn('Screenshot was taken');
    }

    // Entries

    render() {
        const {
            images,
            currentLeadId,
            leads,
        } = this.state;

        let { currentTab } = this.state;

        const lead = leads.find(d => d.id === currentLeadId);

        // FIXME: move this to componentWillUpdate
        const tabs = this.calculateTabsForLead(lead, images);

        // If there is no tabs, the lead must have unrecognized type
        if (!tabs) {
            return (
                <Message>
                    {_ts('editAssessment', 'unrecognizedLeadMessage')}
                </Message>
            );
        }

        // If there is no currentTab, get first visible tab
        if (!currentTab) {
            const tabKeys = Object.keys(tabs).filter(a => !!tabs[a]);
            currentTab = tabKeys.length > 0 ? Object.keys(tabs)[0] : undefined;
        }

        const handleLeadSelectChange = (id) => {
            this.setState({ currentLeadId: id });
        };

        return (
            <Fragment>
                <header className={styles.header}>
                    <div className={styles.leadSelectInputWrap}>
                        <Label
                            className={styles.label}
                            show
                            text="Lead"
                        />
                        <SelectInput
                            hideClearButton
                            className={styles.leadSelectInput}
                            showLabel={false}
                            showHintAndError={false}
                            options={this.leads}
                            keySelector={d => d.id}
                            labelSelector={d => d.title}
                            value={currentLeadId}
                            onChange={handleLeadSelectChange}
                        />
                    </div>
                    <FixedTabs
                        className={styles.tabs}
                        active={currentTab}
                        tabs={tabs}
                        onClick={this.handleTabClick}
                    />
                </header>
                <MultiViewContainer
                    active={currentTab}
                    views={this.views}
                />
            </Fragment>
        );
    }
}
