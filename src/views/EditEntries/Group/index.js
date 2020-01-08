import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import ListView from '#rscv/List/ListView';
import ResizableH from '#rscv/Resizable/ResizableH';
import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import DropZoneTwo from '#rsci/DropZoneTwo';
import Cloak from '#components/general/Cloak';

import {
    editEntriesFilteredEntriesSelector,
    editEntriesFilteredEntryGroupsSelector,
    editEntriesLabelsSelector,
    fieldsMapForTabularBookSelector,
    editEntriesMarkAsDeletedEntryGroupAction,
    editEntriesSetEntryGroupSelectionAction,
    editEntriesClearEntryGroupSelectionAction,
    editEntriesAddEntryGroupAction,
} from '#redux';

import { entryGroupAccessor, entryAccessor } from '#entities/editEntries';

import _cs from '#cs';

import LeftPanel from './LeftPane';
import EntryPreview from '../EntryPreview';

import styles from './styles.scss';

const LabelItem = ({
    labelId,
    title: labelTitle,
    color: labelColor,

    selected,

    entryType,
    image,
    excerpt,
    order: entryOrder,
    tabularFieldId,
    tabularField,

    disabled,
    entryGroupKey,
    onSelectionSet,
    onSelectionClear,
    shouldHideEntryGroupEdit,
}) => (
    <div className={styles.labelItem}>
        <div className={styles.previewTitle}>
            <h5
                className={styles.heading}
                style={{
                    color: labelColor || 'var(--color-text)',
                }}
            >
                {labelTitle}
            </h5>
            { selected && (
                <Cloak
                    hide={shouldHideEntryGroupEdit}
                    render={(
                        <DangerButton
                            className={styles.button}
                            transparent
                            // FIXME: uses strings
                            title="Clear entry"
                            iconName="close"
                            disabled={disabled}
                            onClick={() => {
                                onSelectionClear({
                                    entryGroupKey,
                                    labelId,
                                });
                            }}
                        />
                    )}
                />
            )}
        </div>
        <Cloak
            disable={shouldHideEntryGroupEdit}
            render={(
                <DropZoneTwo
                    className={styles.entryPreview}
                    disabled={disabled}
                    onDrop={(data) => {
                        onSelectionSet({
                            entryGroupKey,
                            selection: {
                                entryId: data.entryId,
                                entryClientId: data.entryKey,
                                labelId,
                            },
                        });
                    }}
                >
                    {selected && (
                        <EntryPreview
                            entryType={entryType}
                            image={image}
                            excerpt={excerpt}
                            order={entryOrder}
                            tabularFieldId={tabularFieldId}
                            tabularField={tabularField}
                        />
                    )}
                </DropZoneTwo>
            )}
        />
    </div>

);


const EntryGroupItem = (props) => {
    const {
        title,
        order,
        className: classNameFromProps,
        disabled,
        entryGroupServerId,
        entryGroupKey,
        labels,
        entries,
        tabularFields,
        selections,
        onMarkAsDelete,
        onSelectionSet,
        onSelectionClear,
        leadId,
    } = props;

    const className = _cs(
        styles.entryGroupItem,
        classNameFromProps,
    );

    const shouldHideEntryGroupDelete = useCallback(
        ({ entryPermissions }) => (
            !entryPermissions.delete && !!entryGroupServerId
        ),
        [entryGroupServerId],
    );

    const shouldHideEntryGroupEdit = useCallback(
        ({ entryPermissions }) => (
            !entryPermissions.modify && !!entryGroupServerId
        ),
        [entryGroupServerId],
    );

    // FIXME: memoize
    const rendererParams = (key, item) => {
        const selection = selections.find(e => e.labelId === key);

        const params = {
            title: item.title,
            color: item.color,
            labelId: key,
            selected: false,

            disabled,
            onSelectionSet,
            onSelectionClear,

            entryGroupKey,
        };

        if (!selection) {
            return params;
        }

        const entry = entries.find(
            e => entryAccessor.key(e) === selection.entryClientId,
        );

        if (!entry) {
            return params;
        }

        const entryData = entryAccessor.data(entry);
        const {
            entryType,
            image,
            excerpt,
            order: entryOrder,
            tabularField: tabularFieldId,
        } = entryData;
        const tabularField = tabularFields[tabularFieldId];

        return {
            ...params,
            selected: true,

            entryType,
            image,
            excerpt,
            order: entryOrder,
            tabularFieldId,
            tabularField,

            shouldHideEntryGroupEdit,
        };
    };

    const handleDelete = useCallback(
        () => {
            onMarkAsDelete({
                key: entryGroupKey,
                value: true,
            });
        },
        [onMarkAsDelete, entryGroupKey],
    );

    return (
        <div className={className}>
            <div className={styles.labelHeader}>
                <h3 className={styles.heading}>
                    {/* FIXME: use strings */}
                    {title || `Group ${order}`}
                </h3>
                <Cloak
                    hide={shouldHideEntryGroupEdit}
                    render={
                        <WarningButton
                            className={styles.button}
                            // FIXME: uses strings
                            title="Edit group"
                            iconName="edit"
                            disabled
                        />
                    }
                />
                <Cloak
                    hide={shouldHideEntryGroupDelete}
                    render={
                        <DangerButton
                            className={styles.button}
                            // FIXME: uses strings
                            title="Delete group"
                            iconName="delete"
                            disabled={disabled}
                            onClick={handleDelete}
                        />
                    }
                />
            </div>
            <ListView
                className={styles.labelContainer}
                data={labels}
                keySelector={item => item.id}
                rendererParams={rendererParams}
                renderer={LabelItem}
            />
        </div>
    );
};
EntryGroupItem.defaultProps = {
    selections: [],
};

const propTypes = {
    bookId: PropTypes.number,
    tabularFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    addEntryGroup: PropTypes.func.isRequired,
};

const defaultProps = {
    bookId: undefined,
    tabularFields: {},
};

const mapStateToProps = (state, props) => ({
    entries: editEntriesFilteredEntriesSelector(state),
    entryGroups: editEntriesFilteredEntryGroupsSelector(state),
    labels: editEntriesLabelsSelector(state),
    tabularFields: fieldsMapForTabularBookSelector(state, props),
});


// FIXME: permissions
const mapDispatchToProps = dispatch => ({
    markAsDeletedEntryGroup: params => dispatch(editEntriesMarkAsDeletedEntryGroupAction(params)),
    setEntryGroupSelection: params => dispatch(editEntriesSetEntryGroupSelectionAction(params)),
    clearEntryGroupSelection: params => dispatch(editEntriesClearEntryGroupSelectionAction(params)),
    addEntryGroup: params => dispatch(editEntriesAddEntryGroupAction(params)),
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

    handleEntryGroupCreate = () => {
        const {
            leadId,
            addEntryGroup,
        } = this.props;

        addEntryGroup({
            leadId,
            entryGroup: {
                selections: [],
            },
        });
    }

    rendererParams = (key, entryGroup) => {
        const {
            labels,
            entries,
            tabularFields,
            disabled,
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
            onSelectionClear: this.clearEntryGroupSelection,
            disabled,
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
                                    <PrimaryButton
                                        onClick={this.handleEntryGroupCreate}
                                        iconName="add"
                                    >
                                        {/* FIXME: use strings */}
                                        Add Entry Group
                                    </PrimaryButton>
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
