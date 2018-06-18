import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import ResizableH from '#rs/components/View/Resizable/ResizableH';
import SelectInput from '#rs/components/Input/SelectInput';

import {
    setActiveEntryAction,
    editEntryCurrentLeadSelector,
} from '#redux';
import _ts from '#ts';
import { entryAccessor } from '#entities/entry';

import LeftPanel from './LeftPanel';
import styles from './styles.scss';

const propTypes = {
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setActiveEntry: PropTypes.func.isRequired,

    // analysisFramework: PropTypes.object.isRequired,
    // eslint-disable-line react/forbid-prop-types
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    filteredEntries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    selectedEntryId: PropTypes.string,
};

const defaultProps = {
    selectedEntryId: undefined,
};

const mapStateToProps = (state, props) => ({
    lead: editEntryCurrentLeadSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setActiveEntry: params => dispatch(setActiveEntryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleEntrySelectChange = (value) => {
        this.props.setActiveEntry({
            leadId: this.props.lead.id,
            entryId: value,
        });
    }

    calcEntryKey = entry => entryAccessor.getKey(entry);

    calcEntryLabelLimited = (entry) => {
        const values = entryAccessor.getValues(entry);
        const text = values.excerpt;
        // FIXME: use strings
        return text || `Excerpt ${values.order}`;
    }

    /*
    renderItemView = (item) => {
        // FIXME: this is slow
        const widget = this.widgets.find(
            w => w.id === item.widgetId,
        );
        const OverviewComponent = widget.overviewComponent;

        return (
            <OverviewComponent
                entryId={this.props.selectedEntryId}
                id={item.id}
                filters={item.filters}
                exportable={item.exportable}
                attribute={item.attribute}
                data={item.data}
            />
        );
    }
*/

    render() {
        const {
            entries,
            filteredEntries,
            lead,
            selectedEntryId,
            setActiveEntry,
        } = this.props;

        return (
            <ResizableH
                className={styles.overview}
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
                leftChild={
                    <LeftPanel
                        entries={entries}
                        lead={lead}
                        selectedEntryId={selectedEntryId}
                        setActiveEntry={setActiveEntry}
                    />
                }
                rightChild={
                    <Fragment>
                        <header className={styles.header}>
                            <div className={styles.entryActions}>
                                <SelectInput
                                    className={styles.selectInput}
                                    placeholder={_ts('editEntry', 'selectExcerptPlaceholder')}
                                    showHintAndError={false}
                                    showLabel={false}
                                    hideClearButton
                                    keySelector={this.calcEntryKey}
                                    labelSelector={this.calcEntryLabelLimited}
                                    options={filteredEntries}
                                    value={selectedEntryId}
                                    onChange={this.handleEntrySelectChange}
                                />
                            </div>
                            <div className={styles.actionButtons}>
                                <Link
                                    className={styles.gotoLink}
                                    to="#/list"
                                    replace
                                >
                                    {_ts('editEntry', 'gotoListButtonLabel')}
                                </Link>
                            </div>
                        </header>
                        <div className={styles.container} />
                    </Fragment>
                }
            />
        );
    }
}
