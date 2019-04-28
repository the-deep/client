import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import Cloak from '#components/general/Cloak';

import { entryAccessor } from '#entities/editEntries';
import {
    editEntriesSetSelectedEntryKeyAction,
    leadIdFromRoute,
    editEntriesMarkAsDeletedEntryAction,
} from '#redux';

import _ts from '#ts';

import WidgetFaram from '../../WidgetFaram';
import HeaderComponent from './HeaderComponent';
import styles from './styles.scss';

const propTypes = {
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
    className: PropTypes.string,
    widgetType: PropTypes.string.isRequired,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func.isRequired,
    leadId: PropTypes.number.isRequired,
    markAsDeletedEntry: PropTypes.func.isRequired,
};

const defaultProps = {
    widgets: [],
    pending: false,
    className: '',
    entry: undefined,
};

const mapStateToProps = state => ({
    leadId: leadIdFromRoute(state),
});

const mapDispatchToProps = dispatch => ({
    setSelectedEntryKey: params => dispatch(editEntriesSetSelectedEntryKeyAction(params)),
    markAsDeletedEntry: params => dispatch(editEntriesMarkAsDeletedEntryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class WidgetFaramContainer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    containerRef = React.createRef();
    dragEnterCount = 0;

    shouldHideEntryDelete = ({ entryPermissions }) => (
        !entryPermissions.delete && !!entryAccessor.serverId(this.props.entry)
    )

    shouldHideEntryEdit = ({ entryPermissions }) => (
        !entryPermissions.modify && !!entryAccessor.serverId(this.props.entry)
    )

    handleEdit = (e) => {
        const entryKey = entryAccessor.key(this.props.entry);
        this.props.setSelectedEntryKey({
            leadId: this.props.leadId,
            key: entryKey,
        });
        window.location.replace('#/overview');
        e.preventDefault();
    };

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
            widgets, // eslint-disable-line no-unused-vars
            className: classNameFromProps,
            pending,
            widgetType,
            entry,

            ...otherProps
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.widgetFaramContainer}
        `;

        const headerClassName = `
            widget-container-header
            ${styles.header}
        `;

        const widgetClassName = `
            widget
            ${styles.widget}
        `;

        return (
            <div
                className={className}
            >
                <header className={headerClassName}>
                    <Cloak
                        hide={this.shouldHideEntryDelete}
                        render={
                            <DangerButton
                                transparent
                                iconName="delete"
                                title={_ts('editEntry.list.widgetForm', 'deleteButtonTooltip')}
                                onClick={this.handleEntryDelete}
                                disabled={pending}
                            />
                        }
                    />
                    <Cloak
                        hide={this.shouldHideEntryEdit}
                        render={
                            <WarningButton
                                transparent
                                onClick={this.handleEdit}
                                title={_ts('editEntry.list.widgetForm', 'editButtonTooltip')}
                                iconName="edit"
                                // NOTE: no need to disable edit on save pending
                            />
                        }
                    />
                </header>
                <WidgetFaram
                    className={widgetClassName}
                    entry={entry}
                    widgets={widgets}
                    pending={pending}
                    widgetType={widgetType}
                    actionComponent={HeaderComponent}
                    {...otherProps}
                />
            </div>
        );
    }
}
