import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import ListView from '#rscv/List/ListView';
import ResizableH from '#rscv/Resizable/ResizableH';

import Cloak from '#components/general/Cloak';
import modalize from '#rscg/Modalize';

import {
    editEntriesFilteredEntriesSelector,
    editEntriesFilteredEntryGroupsSelector,
    editEntriesEntryGroupStatusesSelector,
    editEntriesLabelsSelector,
    fieldsMapForTabularBookSelector,
    editEntriesMarkAsDeletedEntryGroupAction,
    editEntriesSetEntryGroupSelectionAction,
    editEntriesClearEntryGroupSelectionAction,
    editEntriesAddEntryGroupAction,
    editEntriesSetEntryGroupDataAction,
} from '#redux';

import { entryGroupAccessor, ENTRY_STATUS } from '#entities/editEntries';
import EntryGroupEditModal from '#components/general/EntryGroupEditModal';

import _ts from '#ts';

import EntryGroupItem from './EntryGroupItem';
import LeftPanel from './LeftPane';

import styles from './styles.scss';

const PrimaryModalButton = modalize(PrimaryButton);

const propTypes = {
    bookId: PropTypes.number,
    tabularFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    addEntryGroup: PropTypes.func.isRequired,
    entryGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    labels: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    leadId: PropTypes.number.isRequired,

    setEntryGroupSelection: PropTypes.func.isRequired,
    clearEntryGroupSelection: PropTypes.func.isRequired,
    markAsDeletedEntryGroup: PropTypes.func.isRequired,
    setEntryGroupData: PropTypes.func.isRequired,
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    bookId: undefined,
    tabularFields: {},
    entryGroups: [],
    entries: [],
    labels: [],
    statuses: {},
};

const mapStateToProps = (state, props) => ({
    entries: editEntriesFilteredEntriesSelector(state),
    entryGroups: editEntriesFilteredEntryGroupsSelector(state),
    labels: editEntriesLabelsSelector(state),
    tabularFields: fieldsMapForTabularBookSelector(state, props),
    statuses: editEntriesEntryGroupStatusesSelector(state),
});


// FIXME: permissions
const mapDispatchToProps = dispatch => ({
    markAsDeletedEntryGroup: params => dispatch(editEntriesMarkAsDeletedEntryGroupAction(params)),
    setEntryGroupSelection: params => dispatch(editEntriesSetEntryGroupSelectionAction(params)),
    clearEntryGroupSelection: params => dispatch(editEntriesClearEntryGroupSelectionAction(params)),
    addEntryGroup: params => dispatch(editEntriesAddEntryGroupAction(params)),
    setEntryGroupData: params => dispatch(editEntriesSetEntryGroupDataAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Group extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;


    static shouldHideEntryGroupCreate = ({ entryPermissions }) => (
        !entryPermissions.create
    )

    setEntryGroupSelection = (value) => {
        const {
            setEntryGroupSelection,
            leadId,
        } = this.props;
        setEntryGroupSelection({
            ...value,
            leadId,
        });
    }

    setEntryGroupData = (value) => {
        const {
            setEntryGroupData,
            leadId,
        } = this.props;
        setEntryGroupData({
            ...value,
            leadId,
        });
    }

    clearEntryGroupSelection = (value) => {
        const {
            clearEntryGroupSelection,
            leadId,
        } = this.props;
        clearEntryGroupSelection({
            ...value,
            leadId,
        });
    }

    markAsDeletedEntryGroup = (value) => {
        const {
            markAsDeletedEntryGroup,
            leadId,
        } = this.props;
        markAsDeletedEntryGroup({
            ...value,
            leadId,
        });
    }

    handleEntryGroupCreate = (values) => {
        const {
            leadId,
            addEntryGroup,
        } = this.props;

        addEntryGroup({
            leadId,
            entryGroup: {
                ...values,
                selections: [],
            },
        });
    }

    rendererParams = (key, entryGroup) => {
        const {
            labels,
            entries,
            tabularFields,
            statuses,
        } = this.props;
        const {
            title,
            order,
        } = entryGroupAccessor.data(entryGroup);

        const {
            selections,
        } = entryGroupAccessor.data(entryGroup);

        const serverId = entryGroupAccessor.serverId(entryGroup);
        const entryGroupKey = entryGroupAccessor.key(entryGroup);

        return {
            title,
            order,
            entryGroupServerId: serverId,
            entryGroupKey,
            selections,
            labels,
            entries,
            tabularFields,

            onMarkAsDelete: this.markAsDeletedEntryGroup,
            onSelectionSet: this.setEntryGroupSelection,
            onEntryGroupDataSet: this.setEntryGroupData,
            onSelectionClear: this.clearEntryGroupSelection,

            pending: statuses[key] === ENTRY_STATUS.requesting,
        };
    }

    render() {
        const {
            bookId,
            entryGroups,
        } = this.props;
        return (
            <ResizableH
                className={styles.group}
                leftChild={
                    <LeftPanel
                        className={styles.leftPanel}
                        bookId={bookId}
                    />
                }
                rightChild={
                    <React.Fragment>
                        <header className={styles.header}>
                            <Cloak
                                hide={this.shouldHideEntryGroupCreate}
                                render={(
                                    <PrimaryModalButton
                                        modal={
                                            <EntryGroupEditModal
                                                onSave={this.handleEntryGroupCreate}
                                                createMode
                                            />
                                        }
                                        iconName="add"
                                    >
                                        {_ts('editEntry.group', 'addEntryGroupButtonLabel')}
                                    </PrimaryModalButton>
                                )}
                            />
                        </header>
                        <ListView
                            className={styles.content}
                            data={entryGroups}
                            keySelector={entryGroupAccessor.key}
                            rendererParams={this.rendererParams}
                            renderer={EntryGroupItem}
                        />
                    </React.Fragment>
                }
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
            />
        );
    }
}
