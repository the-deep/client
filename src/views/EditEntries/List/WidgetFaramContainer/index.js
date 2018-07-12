import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import DangerButton from '#rs/components/Action/Button/DangerButton';
import WarningButton from '#rs/components/Action/Button/WarningButton';

import { entryAccessor } from '#entities/editEntries';
import { iconNames } from '#constants';
import {
    editEntriesSetSelectedEntryKeyAction,
    leadIdFromRoute,
    editEntriesMarkAsDeletedEntryAction,
} from '#redux';

import HeaderComponent from './HeaderComponent';
import WidgetFaram from '../../WidgetFaram';
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

        // FIXME: use strings
        const deleteButtonTooltip = 'Delete entry';
        const editButtonTooltip = 'Edit entry';

        return (
            <div className={className}>
                <header className={headerClassName}>
                    <DangerButton
                        transparent
                        iconName={iconNames.delete}
                        title={deleteButtonTooltip}
                        onClick={this.handleEntryDelete}
                        disabled={pending}
                    />
                    <WarningButton
                        transparent
                        onClick={this.handleEdit}
                        title={editButtonTooltip}
                        iconName={iconNames.edit}
                        // NOTE: no need to disable edit
                    />
                </header>
                <WidgetFaram
                    className="widget"
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
