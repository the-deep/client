import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ResizableH from '#rscv/Resizable/ResizableH';
import SelectInput from '#rsci/SelectInput';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';

import { entryAccessor } from '#entities/editEntries';

import {
    leadIdFromRoute,
    editEntriesWidgetsSelector,
    editEntriesSelectedEntrySelector,

    editEntriesSelectedEntryKeySelector,
    editEntriesFilteredEntriesSelector,
    editEntriesSetSelectedEntryKeyAction,
    editEntriesMarkAsDeletedEntryAction,
} from '#redux';

import WidgetFaram from '../WidgetFaram';
import { hasWidget } from '../widgets';

import LeadPane from './LeadPane';
import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.number.isRequired,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
    selectedEntryKey: PropTypes.string,
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func.isRequired,
    onExcerptCreate: PropTypes.func.isRequired,
    markAsDeletedEntry: PropTypes.func.isRequired,
};

const defaultProps = {
    entry: undefined,
    widgets: [],
    entries: [],
    pending: false,
    selectedEntryKey: undefined,
};


const mapStateToProps = state => ({
    leadId: leadIdFromRoute(state),
    widgets: editEntriesWidgetsSelector(state),
    entry: editEntriesSelectedEntrySelector(state),
    selectedEntryKey: editEntriesSelectedEntryKeySelector(state),
    entries: editEntriesFilteredEntriesSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSelectedEntryKey: params => dispatch(editEntriesSetSelectedEntryKeyAction(params)),
    markAsDeletedEntry: params => dispatch(editEntriesMarkAsDeletedEntryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static widgetType = 'overview'

    static filterWidgets = widgets => (
        widgets.filter(
            widget => hasWidget(Overview.widgetType, widget.widgetId),
        )
    )

    static entryKeySelector = entry => entryAccessor.key(entry)
    static entryLabelSelector = (entry) => {
        const values = entryAccessor.data(entry);
        const { excerpt, order } = values;
        return excerpt || `Excerpt ${order}`;
    };

    constructor(props) {
        super(props);
        this.widgets = Overview.filterWidgets(props.widgets);
    }

    componentWillReceiveProps(nextProps) {
        const { widgets: oldWidgets } = this.props;
        const { widgets: newWidgets } = nextProps;
        if (newWidgets !== oldWidgets) {
            this.widgets = Overview.filterWidgets(newWidgets);
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
            pending,
            entry,
            leadId, // eslint-disable-line no-unused-vars
            widgets, // eslint-disable-line no-unused-vars
            entries, // eslint-disable-line no-unused-vars
            selectedEntryKey, // eslint-disable-line no-unused-vars

            ...otherProps
        } = this.props;

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
                                hideClearButton
                                keySelector={Overview.entryKeySelector}
                                labelSelector={Overview.entryLabelSelector}
                                onChange={this.handleEntrySelect}
                                options={this.props.entries}
                                placeholder="Select entry"
                                showHintAndError={false}
                                showLabel={false}
                                value={this.props.selectedEntryKey}
                            />
                            <div className={styles.actionButtons}>
                                <SuccessButton
                                    onClick={this.handleEmptyExcerptCreate}
                                >
                                    Add entry
                                </SuccessButton>
                                <DangerButton
                                    onClick={this.handleEntryDelete}
                                    disabled={!entry}
                                >
                                    Remove entry
                                </DangerButton>
                            </div>
                        </header>
                        <WidgetFaram
                            className={styles.content}
                            entry={entry}
                            widgets={this.widgets}
                            pending={pending}
                            widgetType={Overview.widgetType}
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
