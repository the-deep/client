import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import MultiViewContainer from '#rscv/MultiViewContainer';
import Message from '#rscv/Message';
import ScrollTabs from '#rscv/ScrollTabs';

import {
    activeProjectRoleSelector,
    editEntriesLeadSelector,
    editEntriesEntriesSelector,
    editEntriesFilteredEntriesSelector,
    editEntriesStatusesSelector,
    editEntriesSelectedEntryKeySelector,
    editEntriesSetSelectedEntryKeyAction,
    editEntriesMarkAsDeletedEntryAction,
} from '#redux';

import {
    LEAD_TYPE,
    LEAD_PANE_TYPE,
    leadPaneTypeMap,
} from '#entities/lead';

import { entryAccessor } from '#entities/editEntries';

import _ts from '#ts';

import SimplifiedLeadPreview from '#components/leftpanel/SimplifiedLeadPreview';
import LeadPreview from '#components/leftpanel/LeadPreview';
import TabularPreview from '#components/leftpanel/TabularPreview';
import AssistedTagging from '#components/leftpanel/AssistedTagging';
import ImagesGrid from '#components/viewer/ImagesGrid';
import brainIcon from '#resources/img/brain.png';

import EntriesList from './EntriesList';
import styles from './styles.scss';

const propTypes = {
    projectRole: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onExcerptCreate: PropTypes.func.isRequired,
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    filteredEntries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    selectedEntryKey: PropTypes.string,
    setSelectedEntryKey: PropTypes.func.isRequired,
    markAsDeletedEntry: PropTypes.func.isRequired,
};

const defaultProps = {
    projectRole: {},
    entries: [],
    filteredEntries: [],
    statuses: {},
    selectedEntryKey: undefined,
};

const mapStateToProps = state => ({
    projectRole: activeProjectRoleSelector(state),
    lead: editEntriesLeadSelector(state),
    entries: editEntriesEntriesSelector(state),
    filteredEntries: editEntriesFilteredEntriesSelector(state),
    selectedEntryKey: editEntriesSelectedEntryKeySelector(state),
    statuses: editEntriesStatusesSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSelectedEntryKey: params => dispatch(editEntriesSetSelectedEntryKeyAction(params)),
    markAsDeletedEntry: params => dispatch(editEntriesMarkAsDeletedEntryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class LeftPane extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getPaneType = (lead) => {
        if (!lead) {
            return undefined;
        }
        const {
            sourceType: type,
            attachment,
        } = lead;

        if (type === LEAD_TYPE.text) {
            return LEAD_PANE_TYPE.text;
        } else if (type === LEAD_TYPE.website) {
            return LEAD_PANE_TYPE.website;
        }
        if (!attachment) {
            return undefined;
        }
        const { mimeType } = attachment;
        return leadPaneTypeMap[mimeType];
    }

    constructor(props) {
        super(props);

        this.state = {
            images: [],
            currentTab: undefined,
        };

        this.views = this.calculateTabComponents();
    }

    getCurrentTab = (currentTab, tabs) => {
        if (currentTab) {
            return currentTab;
        }
        // If there is no currentTab, get first visible tab
        const tabKeys = Object.keys(tabs).filter(a => !!tabs[a]);
        return tabKeys.length > 0 ? Object.keys(tabs)[0] : undefined;
    }

    getTabsForLead = (lead, images, entryPermissions = {}) => {
        const leadPaneType = LeftPane.getPaneType(lead);
        let tabs = {};
        switch (leadPaneType) {
            case LEAD_PANE_TYPE.csv:
                break;
            case LEAD_PANE_TYPE.spreadsheet:
                tabs = {
                    ...tabs,
                    'original-preview': _ts('editEntry.overview.leftpane', 'tabularTabLabel'),
                    'images-preview': _ts('editEntry.overview.leftpane', 'imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.image:
                tabs = {
                    ...tabs,
                    'original-preview': _ts('editEntry.overview.leftpane', 'imagesTabLabel'),
                    'images-preview': _ts('editEntry.overview.leftpane', 'imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.text:
                tabs = {
                    ...tabs,
                    'simplified-preview': _ts('editEntry.overview.leftpane', 'simplifiedTabLabel'),
                    'assisted-tagging': _ts('editEntry.overview.leftpane', 'assistedTabLabel'),
                    'images-preview': _ts('editEntry.overview.leftpane', 'imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.word:
            case LEAD_PANE_TYPE.pdf:
            case LEAD_PANE_TYPE.presentation:
            case LEAD_PANE_TYPE.website:
                tabs = {
                    ...tabs,
                    'simplified-preview': _ts('editEntry.overview.leftpane', 'simplifiedTabLabel'),
                    'assisted-tagging': _ts('editEntry.overview.leftpane', 'assistedTabLabel'),
                    'original-preview': _ts('editEntry.overview.leftpane', 'originalTabLabel'),
                    'images-preview': _ts('editEntry.overview.leftpane', 'imagesTabLabel'),
                };
                break;
            default:
                return undefined;
        }

        // Dont' show tabular if it is not extracted
        if (lead.tabularBook) {
            tabs['tabular-preview'] = _ts('editEntry.overview.leftpane', 'quantitativeTabLabel');
            delete tabs['original-preview'];
        }
        // Don't show images if there are no images
        if (!images || images.length <= 0) {
            delete tabs['images-preview'];
        }
        // Don't show assisted if no creation permission
        if (!entryPermissions.create) {
            delete tabs['assisted-tagging'];
        }

        tabs['entries-listing'] = _ts('editEntry.overview.leftpane', 'entriesTabLabel');
        return tabs;
    }

    calculateTabComponents = () => ({
        'simplified-preview': {
            component: () => (
                <SimplifiedLeadPreview
                    className={styles.simplifiedPreview}
                    leadId={this.props.lead.id}
                    // FIXME: use memoize here
                    highlights={this.calculateHighlightsForText()}
                    onLoad={this.handleLoad}
                    onClick={this.handleHighlightClick}
                />
            ),
            mount: true,
            wrapContainer: true,
        },
        'tabular-preview': {
            component: () => (
                <TabularPreview
                    className={styles.tabularPreview}
                    bookId={this.props.lead.tabularBook}
                    highlights={this.calculateHighlightsForTabular()}
                    onClick={this.handleHighlightClick}
                />
            ),
            mount: true,
            // lazyMount: true,
            wrapContainer: true,
        },
        'assisted-tagging': {
            component: () => (
                <AssistedTagging
                    className={styles.assistedTagging}
                    leadId={this.props.lead.id}
                    projectId={this.props.lead.project}
                    onEntryAdd={this.handleEntryAdd}
                />
            ),
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
        'original-preview': {
            component: () => {
                const {
                    projectRole: {
                        entryPermissions = {},
                    },
                } = this.props;

                return (
                    <div className={styles.originalPreview}>
                        <LeadPreview
                            lead={this.props.lead}
                            handleScreenshot={this.handleScreenshot}
                            showScreenshot={entryPermissions.create}
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
            wrapContainer: true,
        },
        'entries-listing': {
            component: () => (
                <div className={styles.entriesListContainer}>
                    <EntriesList
                        leadId={this.props.lead.id}
                        entries={this.props.entries}
                        statuses={this.props.statuses}
                        selectedEntryKey={this.props.selectedEntryKey}
                        setSelectedEntryKey={this.props.setSelectedEntryKey}
                        markAsDeletedEntry={this.props.markAsDeletedEntry}
                    />
                </div>
            ),
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
    })

    handleTabClick = (key) => {
        if (key === this.state.currentTab) {
            return;
        }
        this.setState({ currentTab: key });
    }

    // Simplified Lead Preview

    // TODO: memoize this
    calculateHighlightsForText = () => this.props.filteredEntries
        .filter(e => entryAccessor.entryType(e) === 'excerpt')
        .map(entry => ({
            key: entryAccessor.key(entry),
            // text is used by simplified lead preview
            text: entryAccessor.excerpt(entry),
            color: entryAccessor.color(entry) || '#c0c0c0',
        }));

    // TODO: memoize this
    calculateHighlightsForTabular = () => this.props.filteredEntries
        .filter(e => entryAccessor.entryType(e) === 'dataSeries')
        .map(entry => ({
            key: entryAccessor.key(entry),
            // dataSeries fieldId is used by simplified lead preview
            dataSeriesFieldId: (entryAccessor.dataSeries(entry) || {}).fieldId,
            color: entryAccessor.color(entry) || '#c0c0c0',
        }));

    handleHighlightClick = (e, { key }) => {
        this.props.setSelectedEntryKey({
            leadId: this.props.lead.id,
            key,
        });
    }

    handleLoad = (response) => {
        if (response.images) {
            this.setState({ images: response.images });
        }
    }

    // Assisted Tagging

    handleEntryAdd = (text) => {
        this.props.onExcerptCreate({
            type: 'excerpt',
            value: text,
        });
    }

    // Lead Preview

    handleScreenshot = (image) => {
        this.props.onExcerptCreate({
            type: 'image',
            value: image,
        });
    }

    render() {
        const {
            projectRole: { entryPermissions },
            lead,
        } = this.props;
        const {
            images,
            currentTab,
        } = this.state;

        // FIXME: memoize this
        const tabs = this.getTabsForLead(lead, images, entryPermissions);

        // If there is no tabs, the lead must have unrecognized type
        if (!tabs) {
            return (
                <Message>
                    {_ts('editEntry.overview.leftpane', 'unrecognizedLeadMessage')}
                </Message>
            );
        }

        const tabKey = this.getCurrentTab(currentTab, tabs);

        return (
            <Fragment>
                <ScrollTabs
                    className={styles.tabs}
                    active={tabKey}
                    tabs={tabs}
                    onClick={this.handleTabClick}
                >
                    {tabKey === 'assisted-tagging' &&
                        <img
                            className={styles.brainIcon}
                            src={brainIcon}
                            alt=""
                            title={_ts('components.assistedTagging', 'infoTooltip')}
                        />
                    }
                </ScrollTabs>
                <MultiViewContainer
                    active={tabKey}
                    views={this.views}
                />
            </Fragment>
        );
    }
}
