import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import DropdownMenu from '#rsca/DropdownMenu';
import Checkbox from '#rsci/Checkbox';

import _ts from '#ts';

import {
    isExportEnabledForLeads,
    isSaveEnabledForLeads,
    isRemoveEnabledForLeads,
    getExportEnabledForLeads,
    getSaveEnabledForLeads,
    getRemoveEnabledForLeads,

    leadIdSelector,
    leadKeySelector,
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
    completedLeads: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    filteredLeads: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    activeLead: PropTypes.object,

    submitAllPending: PropTypes.bool,

    // eslint-disable-next-line react/forbid-prop-types
    onLeadsSave: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    onLeadsRemove: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    onLeadsExport: PropTypes.func.isRequired,

    filteredDisabled: PropTypes.bool,
};

const defaultProps = {
    className: undefined,
    leadPreviewHidden: false,
    activeLead: undefined,
    submitAllPending: false,
    filteredDisabled: false,
};

export default class LeadActions extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    handleHideLeadPreviewChange = () => {
        const {
            onLeadPreviewHiddenChange,
            leadPreviewHidden,
        } = this.props;

        onLeadPreviewHiddenChange(!leadPreviewHidden);
    }

    handleExportActiveClick = () => {
        const {
            activeLead,
            leadStates,
            onLeadsExport,
        } = this.props;
        const availableLeads = getExportEnabledForLeads([activeLead], leadStates);
        const leadIds = availableLeads.map(leadIdSelector);
        onLeadsExport(leadIds);
    }

    handleExportFilteredClick = () => {
        const {
            filteredLeads,
            leadStates,
            onLeadsExport,
        } = this.props;
        const availableLeads = getExportEnabledForLeads(filteredLeads, leadStates);
        const leadIds = availableLeads.map(leadIdSelector);
        onLeadsExport(leadIds);
    }

    handleExportAllClick = () => {
        const {
            leads,
            leadStates,
            onLeadsExport,
        } = this.props;
        const availableLeads = getExportEnabledForLeads(leads, leadStates);
        const leadIds = availableLeads.map(leadIdSelector);
        onLeadsExport(leadIds);
    }

    handleSaveActiveClicked = () => {
        const {
            activeLead,
            leadStates,
            onLeadsSave,
        } = this.props;
        const availableLeads = getSaveEnabledForLeads([activeLead], leadStates);
        const leadKeys = availableLeads.map(leadKeySelector);
        onLeadsSave(leadKeys);
    }

    handleSaveFilteredClicked = () => {
        const {
            filteredLeads,
            leadStates,
            onLeadsSave,
        } = this.props;
        const availableLeads = getSaveEnabledForLeads(filteredLeads, leadStates);
        const leadKeys = availableLeads.map(leadKeySelector);
        onLeadsSave(leadKeys);
    }

    handleSaveAllClicked = () => {
        const {
            leads,
            leadStates,
            onLeadsSave,
        } = this.props;
        const availableLeads = getSaveEnabledForLeads(leads, leadStates);
        const leadKeys = availableLeads.map(leadKeySelector);
        onLeadsSave(leadKeys);
    }

    handleRemoveActiveClick = () => {
        const {
            activeLead,
            leadStates,
            onLeadsRemove,
        } = this.props;
        const availableLeads = getRemoveEnabledForLeads([activeLead], leadStates);
        const leadKeys = availableLeads.map(leadKeySelector);
        onLeadsRemove(leadKeys);
    }

    handleRemoveFilteredClick = () => {
        const {
            filteredLeads,
            leadStates,
            onLeadsRemove,
        } = this.props;
        const availableLeads = getRemoveEnabledForLeads(filteredLeads, leadStates);
        const leadKeys = availableLeads.map(leadKeySelector);
        onLeadsRemove(leadKeys);
    }

    handleRemoveCompletedClick = () => {
        const {
            completedLeads,
            leadStates,
            onLeadsRemove,
        } = this.props;
        const availableLeads = getRemoveEnabledForLeads(completedLeads, leadStates);
        const leadKeys = availableLeads.map(leadKeySelector);
        onLeadsRemove(leadKeys);
    }

    handleRemoveAllClicked = () => {
        const {
            leads,
            leadStates,
            onLeadsRemove,
        } = this.props;
        const availableLeads = getRemoveEnabledForLeads(leads, leadStates);
        const leadKeys = availableLeads.map(leadKeySelector);
        onLeadsRemove(leadKeys);
    }

    render() {
        const {
            leadPreviewHidden,

            activeLead,
            filteredLeads,
            completedLeads,
            leads,

            leadStates,

            submitAllPending,
            filteredDisabled,

            className,
        } = this.props;

        const exportEnabledForAll = isExportEnabledForLeads(leads, leadStates);
        const exportEnabledForFiltered = isExportEnabledForLeads(filteredLeads, leadStates);
        const exportEnabledForActive = activeLead
            ? isExportEnabledForLeads([activeLead], leadStates)
            : false;

        const saveEnabledForAll = isSaveEnabledForLeads(leads, leadStates);
        const saveEnabledForFiltered = isSaveEnabledForLeads(filteredLeads, leadStates);
        const saveEnabledForActive = activeLead
            ? isSaveEnabledForLeads([activeLead], leadStates)
            : false;

        const removeEnabledForAll = isRemoveEnabledForLeads(leads, leadStates);
        const removeEnabledForCompleted = isRemoveEnabledForLeads(completedLeads, leadStates);
        const removeEnabledForFiltered = isRemoveEnabledForLeads(filteredLeads, leadStates);
        const removeEnabledForActive = activeLead
            ? isRemoveEnabledForLeads([activeLead], leadStates)
            : false;

        return (
            <div className={_cs(styles.actionButtons, className)}>
                <Checkbox
                    className={styles.leadPreviewCheckbox}
                    value={!leadPreviewHidden}
                    onChange={this.handleHideLeadPreviewChange}
                    label={_ts('addLeads.actions', 'showLeadPreviewLabel')}
                />
                <DropdownMenu
                    iconName="openLink"
                    className={styles.exportButtons}
                    title={_ts('addLeads.actions', 'exportButtonTitle')}
                    closeOnClick
                >
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleExportActiveClick}
                        disabled={!exportEnabledForActive}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'exportCurrentButtonTitle')}
                    </button>
                    {!filteredDisabled &&
                        <button
                            className={styles.dropdownButton}
                            onClick={this.handleExportFilteredClick}
                            disabled={submitAllPending || !exportEnabledForFiltered}
                            type="button"
                        >
                            {_ts('addLeads.actions', 'exportAllFilteredButtonTitle')}
                        </button>
                    }
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleExportAllClick}
                        disabled={submitAllPending || !exportEnabledForAll}
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
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleRemoveActiveClick}
                        disabled={!removeEnabledForActive}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'removeCurrentButtonTitle')}
                    </button>
                    {!filteredDisabled &&
                        <button
                            className={styles.dropdownButton}
                            onClick={this.handleRemoveFilteredClick}
                            disabled={submitAllPending || !removeEnabledForFiltered}
                            type="button"
                        >
                            {_ts('addLeads.actions', 'removeAllFilteredButtonTitle')}
                        </button>
                    }
                    <button
                        className={styles.dropdownButton}
                        disabled={submitAllPending || !removeEnabledForCompleted}
                        onClick={this.handleRemoveCompletedClick}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'removeAllCompletedButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleRemoveAllClicked}
                        disabled={submitAllPending || !removeEnabledForAll}
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
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleSaveActiveClicked}
                        disabled={!saveEnabledForActive}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'saveCurrentButtonTitle')}
                    </button>
                    {!filteredDisabled &&
                        <button
                            className={styles.dropdownButton}
                            onClick={this.handleSaveFilteredClicked}
                            disabled={submitAllPending || !saveEnabledForFiltered}
                            type="button"
                        >
                            {_ts('addLeads.actions', 'saveAllFilteredButtonTitle')}
                        </button>
                    }
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleSaveAllClicked}
                        disabled={submitAllPending || !saveEnabledForAll}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'saveAllButtonTitle')}
                    </button>
                </DropdownMenu>
            </div>
        );
    }
}
