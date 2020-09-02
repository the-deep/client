import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';

import DropdownMenu from '#rsca/DropdownMenu';
import Checkbox from '#rsci/Checkbox';

import _ts from '#ts';

import {
    leadAddPageLeadPreviewHiddenSelector,
    leadAddSetLeadPreviewHiddenAction,
    leadAddPageActiveLeadSelector,
    leadAddPageLeadsSelector,
} from '#redux';

import {
    isExportEnabledForLeads,
    isSaveEnabledForLeads,
    isRemoveEnabledForLeads,
    getExportEnabledForLeads,
    getSaveEnabledForLeads,
    getRemoveEnabledForLeads,

    leadIdSelector,
    leadKeySelector,

    LEAD_STATUS,
} from '../utils';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    leadPreviewHidden: PropTypes.bool,
    onLeadPreviewHiddenChange: PropTypes.func.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    leadStates: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    leads: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    activeLead: PropTypes.object,

    disabled: PropTypes.bool,

    // eslint-disable-next-line react/forbid-prop-types
    onLeadsSave: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    onLeadsRemove: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    onLeadsExport: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
    leadPreviewHidden: false,
    activeLead: undefined,
    disabled: false,
};

function LeadActions(props) {
    const {
        activeLead,
        className,
        disabled,
        leadPreviewHidden,
        leadStates,
        leads,
        onLeadPreviewHiddenChange,
        onLeadsExport,
        onLeadsRemove,
        onLeadsSave,
    } = props;

    const completedLeads = useMemo(
        () => leads.filter(
            (lead) => {
                const key = leadKeySelector(lead);
                const leadState = leadStates[key];
                return leadState === LEAD_STATUS.complete;
            },
        ),
        [leads, leadStates],
    );

    const handleHideLeadPreviewChange = useCallback(
        () => {
            onLeadPreviewHiddenChange(!leadPreviewHidden);
        },
        [leadPreviewHidden, onLeadPreviewHiddenChange],
    );

    const handleExportActiveClick = useCallback(
        () => {
            const availableLeads = getExportEnabledForLeads([activeLead], leadStates);
            const leadIds = availableLeads.map(leadIdSelector);
            onLeadsExport(leadIds);
        },
        [onLeadsExport, activeLead, leadStates],
    );

    const handleExportAllClick = useCallback(
        () => {
            const availableLeads = getExportEnabledForLeads(leads, leadStates);
            const leadIds = availableLeads.map(leadIdSelector);
            onLeadsExport(leadIds);
        },
        [onLeadsExport, leads, leadStates],
    );

    const handleSaveActiveClicked = useCallback(
        () => {
            const availableLeads = getSaveEnabledForLeads([activeLead], leadStates);
            const leadKeys = availableLeads.map(leadKeySelector);
            onLeadsSave(leadKeys);
        },
        [onLeadsSave, activeLead, leadStates],
    );

    const handleSaveAllClicked = useCallback(
        () => {
            const availableLeads = getSaveEnabledForLeads(leads, leadStates);
            const leadKeys = availableLeads.map(leadKeySelector);
            onLeadsSave(leadKeys);
        },
        [onLeadsSave, leads, leadStates],
    );

    const handleRemoveActiveClick = useCallback(
        () => {
            const availableLeads = getRemoveEnabledForLeads([activeLead], leadStates);
            const leadKeys = availableLeads.map(leadKeySelector);
            onLeadsRemove(leadKeys);
        },
        [onLeadsRemove, activeLead, leadStates],
    );

    const handleRemoveCompletedClick = useCallback(
        () => {
            const availableLeads = getRemoveEnabledForLeads(completedLeads, leadStates);
            const leadKeys = availableLeads.map(leadKeySelector);
            onLeadsRemove(leadKeys);
        },
        [onLeadsRemove, completedLeads, leadStates],
    );

    const handleRemoveAllClicked = useCallback(
        () => {
            const availableLeads = getRemoveEnabledForLeads(leads, leadStates);
            const leadKeys = availableLeads.map(leadKeySelector);
            onLeadsRemove(leadKeys);
        },
        [onLeadsRemove, leads, leadStates],
    );

    const exportEnabledForAll = isExportEnabledForLeads(leads, leadStates);
    const exportEnabledForActive = activeLead
        ? isExportEnabledForLeads([activeLead], leadStates)
        : false;

    const saveEnabledForAll = isSaveEnabledForLeads(leads, leadStates);
    const saveEnabledForActive = activeLead
        ? isSaveEnabledForLeads([activeLead], leadStates)
        : false;

    const removeEnabledForAll = isRemoveEnabledForLeads(leads, leadStates);
    const removeEnabledForCompleted = isRemoveEnabledForLeads(completedLeads, leadStates);
    const removeEnabledForActive = activeLead
        ? isRemoveEnabledForLeads([activeLead], leadStates)
        : false;

    const selectedDisabled = !activeLead;

    return (
        <div className={_cs(styles.actionButtons, className)}>
            <Checkbox
                className={styles.leadPreviewCheckbox}
                value={!leadPreviewHidden}
                onChange={handleHideLeadPreviewChange}
                label={_ts('addLeads.actions', 'showLeadPreviewLabel')}
            />
            <DropdownMenu
                iconName="openLink"
                className={styles.exportButtons}
                title={_ts('addLeads.actions', 'exportButtonTitle')}
                closeOnClick
            >
                {!selectedDisabled &&
                    <button
                        className={styles.dropdownButton}
                        onClick={handleExportActiveClick}
                        disabled={!exportEnabledForActive}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'exportCurrentButtonTitle')}
                    </button>
                }
                <button
                    className={styles.dropdownButton}
                    onClick={handleExportAllClick}
                    disabled={disabled || !exportEnabledForAll}
                    type="button"
                >
                    {_ts('addLeads.actions', 'exportAllCompletedButtonTitle')}
                </button>
            </DropdownMenu>
            <DropdownMenu
                iconName="delete"
                className={styles.removeButtons}
                title={_ts('addLeads.actions', 'removeButtonTitle')}
                closeOnClick
            >
                {!selectedDisabled &&
                    <button
                        className={styles.dropdownButton}
                        onClick={handleRemoveActiveClick}
                        disabled={!removeEnabledForActive}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'removeCurrentButtonTitle')}
                    </button>
                }
                <button
                    className={styles.dropdownButton}
                    disabled={disabled || !removeEnabledForCompleted}
                    onClick={handleRemoveCompletedClick}
                    type="button"
                >
                    {_ts('addLeads.actions', 'removeAllCompletedButtonTitle')}
                </button>
                <button
                    className={styles.dropdownButton}
                    onClick={handleRemoveAllClicked}
                    disabled={disabled || !removeEnabledForAll}
                    type="button"
                >
                    {_ts('addLeads.actions', 'removeAllButtonTitle')}
                </button>
            </DropdownMenu>
            <DropdownMenu
                iconName="save"
                className={styles.saveButtons}
                title={_ts('addLeads.actions', 'saveButtonTitle')}
                closeOnClick
            >
                {!selectedDisabled &&
                    <button
                        className={styles.dropdownButton}
                        onClick={handleSaveActiveClicked}
                        disabled={!saveEnabledForActive}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'saveCurrentButtonTitle')}
                    </button>
                }
                <button
                    className={styles.dropdownButton}
                    onClick={handleSaveAllClicked}
                    disabled={disabled || !saveEnabledForAll}
                    type="button"
                >
                    {_ts('addLeads.actions', 'saveAllButtonTitle')}
                </button>
            </DropdownMenu>
        </div>
    );
}
LeadActions.propTypes = propTypes;
LeadActions.defaultProps = defaultProps;

const mapStateToProps = state => ({
    leadPreviewHidden: leadAddPageLeadPreviewHiddenSelector(state),
    activeLead: leadAddPageActiveLeadSelector(state),
    leads: leadAddPageLeadsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    onLeadPreviewHiddenChange: params => dispatch(leadAddSetLeadPreviewHiddenAction(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(
    LeadActions,
);
