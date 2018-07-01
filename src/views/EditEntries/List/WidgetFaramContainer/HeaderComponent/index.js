import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import WarningConfirmButton from '#rsca/ConfirmButton/WarningConfirmButton';
import AccentConfirmButton from '#rsca/ConfirmButton/AccentConfirmButton';

import {
    leadIdFromRoute,
    editEntriesApplyToAllEntriesAction,
    editEntriesApplyToAllEntriesBelowAction,
} from '#redux';

import { iconNames } from '#constants';
import _ts from '#ts';

const mapStateToProps = state => ({
    leadId: leadIdFromRoute(state),
});

const mapDispatchToProps = dispatch => ({
    applyToAllEntries: params => dispatch(editEntriesApplyToAllEntriesAction(params)),
    applyToAllEntriesBelow: params => dispatch(editEntriesApplyToAllEntriesBelowAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class HeaderComponent extends React.PureComponent {
    static propTypes = {
        attributeKey: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]).isRequired,
        attributeData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
        applyToAllEntries: PropTypes.func.isRequired,
        applyToAllEntriesBelow: PropTypes.func.isRequired,
        leadId: PropTypes.number.isRequired,
        entryKey: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]).isRequired,
    };

    static defaultProps = {
        attributeData: undefined,
    }

    handleApplyAll = () => {
        const { attributeKey, attributeData, leadId, entryKey } = this.props;
        this.props.applyToAllEntries({
            leadId,
            key: attributeKey,
            value: attributeData,
            entryKey,
        });
    }

    handleApplyAllBelow = () => {
        const { attributeKey, attributeData, leadId, entryKey } = this.props;
        this.props.applyToAllEntriesBelow({
            leadId,
            key: attributeKey,
            value: attributeData,
            entryKey,
        });
    }

    render() {
        return (
            <Fragment>
                <AccentConfirmButton
                    title={_ts('editEntry', 'applyAllButtonTitle')}
                    tabIndex="-1"
                    transparent
                    iconName={iconNames.applyAll}
                    confirmationMessage={_ts('editEntry', 'applyToAll')}
                    onClick={this.handleApplyAll}
                />
                <WarningConfirmButton
                    title={_ts('editEntry', 'applyAllBelowButtonTitle')}
                    tabIndex="-1"
                    transparent
                    iconName={iconNames.applyAllBelow}
                    confirmationMessage={_ts('editEntry', 'applyToAllBelow')}
                    onClick={this.handleApplyAllBelow}
                />
            </Fragment>
        );
    }
}
