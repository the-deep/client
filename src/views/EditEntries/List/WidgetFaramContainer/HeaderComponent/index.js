import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import WarningConfirmButton from '#rsca/ConfirmButton/WarningConfirmButton';
import AccentConfirmButton from '#rsca/ConfirmButton/AccentConfirmButton';
import PrimaryConfirmButton from '#rsca/ConfirmButton/PrimaryConfirmButton';

import {
    leadIdFromRoute,
    editEntriesApplyToAllEntriesAction,
    editEntriesApplyToAllEntriesBelowAction,
    editEntriesFormatAllEntriesAction,
    activeProjectRoleSelector,
} from '#redux';

import { iconNames } from '#constants';
import _ts from '#ts';

const propTypes = {
    projectRole: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    attributeKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    attributeData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    applyToAllEntries: PropTypes.func.isRequired,
    applyToAllEntriesBelow: PropTypes.func.isRequired,
    formatAllEntries: PropTypes.func.isRequired,
    leadId: PropTypes.number.isRequired,
    entryKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    widgetId: PropTypes.string.isRequired,
};

const defaultProps = {
    projectRole: {},
    attributeData: undefined,
};

const mapStateToProps = state => ({
    leadId: leadIdFromRoute(state),
    projectRole: activeProjectRoleSelector(state),
});

const mapDispatchToProps = dispatch => ({
    applyToAllEntries: params => dispatch(editEntriesApplyToAllEntriesAction(params)),
    applyToAllEntriesBelow: params => dispatch(editEntriesApplyToAllEntriesBelowAction(params)),
    formatAllEntries: params => dispatch(editEntriesFormatAllEntriesAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class HeaderComponent extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    isEntriesModifiable = () => {
        const { entryPermissions = {} } = this.props.projectRole;
        return entryPermissions.modify;
    }

    handleFormatAll = () => {
        const { leadId } = this.props;
        this.props.formatAllEntries({
            leadId,
            modifiable: this.isEntriesModifiable(),
        });
    }

    handleApplyAll = () => {
        const { attributeKey, attributeData, leadId, entryKey } = this.props;
        this.props.applyToAllEntries({
            leadId,
            key: attributeKey,
            value: attributeData,
            entryKey,
            modifiable: this.isEntriesModifiable(),
        });
    }

    handleApplyAllBelow = () => {
        const { attributeKey, attributeData, leadId, entryKey } = this.props;
        this.props.applyToAllEntriesBelow({
            leadId,
            key: attributeKey,
            value: attributeData,
            entryKey,
            modifiable: this.isEntriesModifiable(),
        });
    }

    render() {
        const { widgetId } = this.props;

        if (widgetId === 'excerptWidget') {
            return (
                <PrimaryConfirmButton
                    title={_ts('editEntry.list.widgetForm', 'formatAllButtonTitle')}
                    tabIndex="-1"
                    transparent
                    iconName={iconNames.format}
                    confirmationMessage={_ts('editEntry.list.widgetForm', 'formatAll')}
                    onClick={this.handleFormatAll}
                />
            );
        }

        return (
            <Fragment>
                <AccentConfirmButton
                    title={_ts('editEntry.list.widgetForm', 'applyAllButtonTitle')}
                    tabIndex="-1"
                    transparent
                    iconName={iconNames.applyAll}
                    confirmationMessage={_ts('editEntry.list.widgetForm', 'applyToAll')}
                    onClick={this.handleApplyAll}
                />
                <WarningConfirmButton
                    title={_ts('editEntry.list.widgetForm', 'applyAllBelowButtonTitle')}
                    tabIndex="-1"
                    transparent
                    iconName={iconNames.applyAllBelow}
                    confirmationMessage={_ts('editEntry.list.widgetForm', 'applyToAllBelow')}
                    onClick={this.handleApplyAllBelow}
                />
            </Fragment>
        );
    }
}
