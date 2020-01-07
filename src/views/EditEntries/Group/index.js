import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import ListView from '#rscv/List/ListView';
import ResizableH from '#rscv/Resizable/ResizableH';
import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import Cloak from '#components/general/Cloak';

import {
    editEntriesFilteredEntriesSelector,
    editEntriesFilteredEntryGroupsSelector,
    editEntriesLabelsSelector,
    fieldsMapForTabularBookSelector,
} from '#redux';

import { entryGroupAccessor, entryAccessor } from '#entities/editEntries';

import _cs from '#cs';

import LeftPanel from './LeftPane';
import EntryPreview from '../EntryPreview';

import styles from './styles.scss';

const EntryGroupItem = (props) => {
    const {
        title,
        order,
        className: classNameFromProps,
        disabled,
        entryGroupServerId,
        labels,
        entries,
        tabularFields,
        selections,
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

        if (!selection) {
            return {
                title: item.title,
                color: item.coor,
            };
        }

        const entry = entries.find(e => entryAccessor.key(e) === selection.entryClientId);

        if (!entry) {
            return {
                title: item.title,
                color: item.coor,
            };
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
            title: item.title,
            color: item.color,

            selected: true,
            entryType,
            image,
            excerpt,
            order: entryOrder,
            tabularFieldId,
            tabularField,
        };
    };

    const renderer = ({
        title: labelTitle,
        selected,
        entryType,
        image,
        excerpt,
        order: entryOrder,
        tabularFieldId,
        tabularField,
    }) => (
        <div className={styles.labelItem}>
            <h5>
                {labelTitle}
            </h5>
            {selected && (
                <EntryPreview
                    className={styles.entryPreview}
                    entryType={entryType}
                    image={image}
                    excerpt={excerpt}
                    order={entryOrder}
                    tabularFieldId={tabularFieldId}
                    tabularField={tabularField}
                />
            )}
        </div>
    );

    return (
        <div className={className}>
            <div className={styles.header}>
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
                            disabled={disabled}
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
                        />
                    }
                />
            </div>
            <ListView
                className={styles.labelContainer}
                data={labels}
                keySelector={item => item.id}
                rendererParams={rendererParams}
                renderer={renderer}
            />
        </div>
    );
};

const propTypes = {
    bookId: PropTypes.number,
    tabularFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
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

@connect(mapStateToProps)
export default class Group extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    rendererParams = (key, entryGroup) => {
        const {
            labels,
            entries,
            tabularFields,
        } = this.props;
        const {
            title,
            order,
        } = entryGroupAccessor.data(entryGroup);

        const {
            selections,
        } = entryGroupAccessor.data(entryGroup);
        const serverId = entryGroupAccessor.serverId(entryGroup);

        return {
            title,
            order,
            entryGroupServerId: serverId,
            selections,
            labels,
            entries,
            tabularFields,
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
                        {/*
                        <header className={styles.header}>
                            3 labels, 5 groups
                        </header>
                        */}
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
