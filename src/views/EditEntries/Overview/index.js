import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ResizableH from '#rscv/Resizable/ResizableH';
import SelectInput from '#rsci/SelectInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import {
    entryAccessor,
    ENTRY_STATUS,
} from '#entities/editEntries';
import {
    leadIdFromRoute,
    editEntriesWidgetsSelector,
    editEntriesSelectedEntrySelector,
    editEntriesStatusesSelector,

    editEntriesSelectedEntryKeySelector,
    editEntriesFilteredEntriesSelector,
    editEntriesSetSelectedEntryKeyAction,
    editEntriesMarkAsDeletedEntryAction,
} from '#redux';
import {
    widgetVisibility,
    VISIBILITY,
    VIEW,
} from '#widgets';

import _ts from '#ts';

import WidgetFaram from '../WidgetFaram';
import LeadPane from './LeadPane';
import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.number.isRequired,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectedEntryKey: PropTypes.string,
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func.isRequired,
    onExcerptCreate: PropTypes.func.isRequired,
    markAsDeletedEntry: PropTypes.func.isRequired,
};

const defaultProps = {
    entry: undefined,
    widgets: [],
    entries: [],
    statuses: {},
    selectedEntryKey: undefined,
};


const mapStateToProps = state => ({
    leadId: leadIdFromRoute(state),
    widgets: editEntriesWidgetsSelector(state),
    entry: editEntriesSelectedEntrySelector(state),
    selectedEntryKey: editEntriesSelectedEntryKeySelector(state),
    entries: editEntriesFilteredEntriesSelector(state),
    statuses: editEntriesStatusesSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSelectedEntryKey: params => dispatch(editEntriesSetSelectedEntryKeyAction(params)),
    markAsDeletedEntry: params => dispatch(editEntriesMarkAsDeletedEntryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static filterWidgets = (widgets, widgetType) => widgets.filter(
        w => widgetVisibility(w.widgetId, widgetType, w.properties.addedFrom) !== VISIBILITY.hidden,
    );

    static entryKeySelector = entry => entryAccessor.key(entry)

    static entryLabelSelector = (entry) => {
        const values = entryAccessor.data(entry);
        const { excerpt, order } = values;
        return excerpt || _ts('editEntry.overview', 'unnamedExcerptTitle', { index: order });
    };

    constructor(props) {
        super(props);
        this.widgets = Overview.filterWidgets(props.widgets, VIEW.overview);
    }

    componentWillReceiveProps(nextProps) {
        const { widgets: oldWidgets } = this.props;
        const { widgets: newWidgets } = nextProps;
        if (newWidgets !== oldWidgets) {
            this.widgets = Overview.filterWidgets(newWidgets, VIEW.overview);
        }
    }

    handleEntrySelect = (entryKey) => {
        this.props.setSelectedEntryKey({
            leadId: this.props.leadId,
            key: entryKey,
        });
    }

    handleEmptyExcerptCreate = () => {
        // NOTE: onExcerptCreate should be passed to widgetfaram as well
        this.props.onExcerptCreate({ type: 'excerpt', value: '' });
    }

    handleEntryDelete = () => {
        const { entry } = this.props;
        if (!entry) {
            return;
        }
        this.props.markAsDeletedEntry({
            leadId: this.props.leadId,
            key: entryAccessor.key(entry),
            value: true,
        });
    }

    render() {
        const {
            entry,
            leadId, // eslint-disable-line no-unused-vars
            widgets, // eslint-disable-line no-unused-vars
            entries, // eslint-disable-line no-unused-vars
            statuses,
            selectedEntryKey, // eslint-disable-line no-unused-vars

            ...otherProps
        } = this.props;

        const pending = statuses[selectedEntryKey] === ENTRY_STATUS.requesting;

        return (
            <ResizableH
                className={styles.overview}
                leftChild={
                    <LeadPane
                        onExcerptCreate={this.props.onExcerptCreate}
                    />
                }
                rightChild={
                    <React.Fragment>
                        <header className={styles.header}>
                            <SelectInput
                                className={styles.entrySelectInput}
                                placeholder={_ts('editEntry.overview', 'selectEntryPlaceholder')}
                                keySelector={Overview.entryKeySelector}
                                labelSelector={Overview.entryLabelSelector}
                                onChange={this.handleEntrySelect}
                                options={this.props.entries}
                                value={this.props.selectedEntryKey}
                                showHintAndError={false}
                                showLabel={false}
                                hideClearButton
                            />
                            <div className={styles.actionButtons}>
                                <DangerButton
                                    onClick={this.handleEntryDelete}
                                    disabled={!entry || pending}
                                >
                                    {_ts('editEntry.overview', 'removeExcerptButtonTitle')}
                                </DangerButton>
                                <PrimaryButton
                                    onClick={this.handleEmptyExcerptCreate}
                                    className={styles.addNewEntryButton}
                                >
                                    {_ts('editEntry.overview', 'addExcerptButtonTitle')}
                                </PrimaryButton>
                            </div>
                        </header>
                        <WidgetFaram
                            className={styles.content}
                            entry={entry}
                            pending={pending}
                            widgets={this.widgets}
                            widgetType={VIEW.overview}
                            {...otherProps}
                        />
                    </React.Fragment>
                }
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
            />
        );
    }
}
