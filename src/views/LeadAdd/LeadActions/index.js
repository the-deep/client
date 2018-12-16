/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '#rsca/Button';
import Checkbox from '#rsci/Checkbox';
import DropdownMenu from '#rsca/DropdownMenu';
import Confirm from '#rscv/Modal/Confirm';

import { iconNames } from '#constants';
import _ts from '#ts';
import notify from '#notify';
import {
    addLeadViewActiveLeadIdSelector,

    addLeadViewCanNextSelector,
    addLeadViewCanPrevSelector,
    addLeadViewLeadNextAction,
    addLeadViewLeadPrevAction,
    addLeadViewButtonStatesSelector,
    addLeadViewLeadStatesSelector,
    addLeadViewLeadRemoveAction,
    addLeadViewLeadKeysSelector,
    addLeadViewFilteredLeadKeysSelector,
    addLeadViewCompletedLeadKeysSelector,
    addLeadViewSetRemoveModalStateAction,
    addLeadViewUnsetRemoveModalStateAction,
    addLeadViewRemoveModalStateSelector,

    addLeadViewHidePreviewSelector,
    addLeadViewSetPreviewAction,
} from '#redux';

import styles from './styles.scss';

// 5544735

const defaultProps = {
    activeLeadId: undefined,
    hidePreview: false,
};

const propTypes = {
    addLeadViewCanNext: PropTypes.bool.isRequired,
    addLeadViewCanPrev: PropTypes.bool.isRequired,
    addLeadViewLeadNext: PropTypes.func.isRequired,
    addLeadViewLeadPrev: PropTypes.func.isRequired,

    pendingSubmitAll: PropTypes.bool.isRequired,

    buttonStates: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadStates: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeLeadId: PropTypes.string,

    addLeadViewLeadRemove: PropTypes.func.isRequired,
    leadKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
    filteredLeadKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
    completedLeadKeys: PropTypes.arrayOf(PropTypes.string).isRequired,

    setRemoveModalState: PropTypes.func.isRequired,
    unsetRemoveModalState: PropTypes.func.isRequired,
    removeModalState: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    // eslint-disable-next-line react/forbid-prop-types
    uploadCoordinator: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    formCoordinator: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    leadFormSubmitters: PropTypes.object.isRequired,

    hidePreview: PropTypes.bool,
    setPreview: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    addLeadViewCanNext: addLeadViewCanNextSelector(state),
    addLeadViewCanPrev: addLeadViewCanPrevSelector(state),
    buttonStates: addLeadViewButtonStatesSelector(state),
    leadStates: addLeadViewLeadStatesSelector(state),
    activeLeadId: addLeadViewActiveLeadIdSelector(state),

    leadKeys: addLeadViewLeadKeysSelector(state),
    filteredLeadKeys: addLeadViewFilteredLeadKeysSelector(state),
    completedLeadKeys: addLeadViewCompletedLeadKeysSelector(state),
    removeModalState: addLeadViewRemoveModalStateSelector(state),
    hidePreview: addLeadViewHidePreviewSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLeadViewLeadNext: params => dispatch(addLeadViewLeadNextAction(params)),
    addLeadViewLeadPrev: params => dispatch(addLeadViewLeadPrevAction(params)),

    addLeadViewLeadRemove: params => dispatch(addLeadViewLeadRemoveAction(params)),
    setRemoveModalState: params => dispatch(addLeadViewSetRemoveModalStateAction(params)),
    unsetRemoveModalState: params => dispatch(addLeadViewUnsetRemoveModalStateAction(params)),
    setPreview: params => dispatch(addLeadViewSetPreviewAction(params)),
});

export const DELETE_MODE = {
    all: 'all',
    filtered: 'filtered',
    single: 'single',
    saved: 'saved',
};

@connect(mapStateToProps, mapDispatchToProps)
export default class LeadFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleNextButtonClick = () => {
        this.props.addLeadViewLeadNext();
    }

    handlePrevButtonClick = () => {
        this.props.addLeadViewLeadPrev();
    }

    handleRemoveButtonClick = () => {
        this.props.setRemoveModalState({
            show: true,
            mode: DELETE_MODE.single,
            leadId: this.props.activeLeadId,
        });
    }

    handleFilteredRemoveButtonClick = () => {
        this.props.setRemoveModalState({
            show: true,
            mode: DELETE_MODE.filtered,
        });
    }

    handleSavedRemoveButtonClick = () => {
        this.props.setRemoveModalState({
            show: true,
            mode: DELETE_MODE.saved,
        });
    }

    handleBulkRemoveButtonClick = () => {
        this.props.setRemoveModalState({
            show: true,
            mode: DELETE_MODE.all,
        });
    }


    removeSelected = (leadId) => {
        this.props.uploadCoordinator.remove(leadId);
        this.props.addLeadViewLeadRemove(leadId);

        notify.send({
            title: _ts('addLeads.actions', 'leadDiscard'),
            type: notify.type.SUCCESS,
            message: _ts('addLeads.actions', 'leadDiscardSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    removeFiltered = () => {
        this.props.filteredLeadKeys.forEach((leadId) => {
            this.props.uploadCoordinator.remove(leadId);
            this.props.addLeadViewLeadRemove(leadId);
        });

        notify.send({
            title: _ts('addLeads.actions', 'leadsDiscard'),
            type: notify.type.SUCCESS,
            message: _ts('addLeads.actions', 'leadsDiscardSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    removeCompleted = () => {
        this.props.completedLeadKeys.forEach((leadId) => {
            this.props.uploadCoordinator.remove(leadId);
            this.props.addLeadViewLeadRemove(leadId);
        });

        notify.send({
            title: _ts('addLeads.actions', 'leadsDiscard'),
            type: notify.type.SUCCESS,
            message: _ts('addLeads.actions', 'leadsDiscardSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    removeBulk = () => {
        this.props.leadKeys.forEach((leadId) => {
            this.props.uploadCoordinator.remove(leadId);
            this.props.addLeadViewLeadRemove(leadId);
        });

        notify.send({
            title: _ts('addLeads.actions', 'leadsDiscard'),
            type: notify.type.SUCCESS,
            message: _ts('addLeads.actions', 'leadsDiscardSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleRemoveLeadModalClose = (confirm) => {
        if (confirm) {
            const {
                leadId,
                mode,
            } = this.props.removeModalState;

            switch (mode) {
                case DELETE_MODE.single:
                    this.removeSelected(leadId);
                    break;
                case DELETE_MODE.filtered:
                    this.removeFiltered();
                    break;
                case DELETE_MODE.all:
                    this.removeBulk();
                    break;
                case DELETE_MODE.saved:
                    this.removeCompleted();
                    break;
                default:
                    break;
            }
        }

        this.props.unsetRemoveModalState();
    }

    handleSaveButtonClick = () => {
        const leadId = this.props.activeLeadId;
        this.props.formCoordinator.add(leadId, this.props.leadFormSubmitters[leadId]);
        this.props.formCoordinator.start();
    }

    handleFilteredSaveButtonClick = () => {
        this.props.filteredLeadKeys.forEach((id) => {
            this.props.formCoordinator.add(id, this.props.leadFormSubmitters[id]);
        });
        this.props.formCoordinator.start();
    }

    handleBulkSaveButtonClick = () => {
        this.props.leadKeys.forEach((id) => {
            this.props.formCoordinator.add(id, this.props.leadFormSubmitters[id]);
        });
        this.props.formCoordinator.start();
    }

    handlePreviewHide = () => {
        const {
            setPreview,
            hidePreview,
        } = this.props;

        setPreview(!hidePreview);
    }

    render() {
        const {
            addLeadViewCanNext,
            addLeadViewCanPrev,
            pendingSubmitAll,

            buttonStates,
            leadStates,
            activeLeadId,
            removeModalState,
        } = this.props;

        const { show } = removeModalState;

        const {
            isSaveEnabledForAll,
            isRemoveEnabledForAll,
            isSaveEnabledForFiltered,
            isRemoveEnabledForFiltered,
            isRemoveEnabledForCompleted,
        } = buttonStates;

        // FIXME: doesn't require pulling all leadStates
        const {
            isSaveDisabled: isSaveDisabledForActive,
            isRemoveDisabled: isRemoveDisabledForActive,
        } = leadStates[activeLeadId] || {};

        return (
            <div className={styles.actionButtons}>
                <Checkbox
                    value={!this.props.hidePreview}
                    onChange={this.handlePreviewHide}
                    label={_ts('addLeads.actions', 'showLeadPreviewLabel')}
                />
                <div className={styles.movementButtons}>
                    <Button
                        disabled={!addLeadViewCanPrev}
                        onClick={this.handlePrevButtonClick}
                        iconName={iconNames.prev}
                        title={_ts('addLeads.actions', 'previousButtonLabel')}
                    />
                    <Button
                        disabled={!addLeadViewCanNext}
                        onClick={this.handleNextButtonClick}
                        iconName={iconNames.next}
                        title={_ts('addLeads.actions', 'nextButtonLabel')}
                    />
                </div>
                {/* FIXME: use ConfirmButton */}
                <Confirm
                    onClose={this.handleRemoveLeadModalClose}
                    show={!!show}
                >
                    <p>
                        {
                            /* TODO: different message for delete modes */
                            _ts('addLeads.actions', 'deleteLeadConfirmText')
                        }
                    </p>
                </Confirm>
                <DropdownMenu
                    iconName={iconNames.delete}
                    className={styles.removeButtons}
                    title={_ts('addLeads.actions', 'removeButtonTitle')}
                    closeOnClick
                >
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleRemoveButtonClick}
                        disabled={isRemoveDisabledForActive}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'removeCurrentButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleFilteredRemoveButtonClick}
                        disabled={!isRemoveEnabledForFiltered}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'removeAllFilteredButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        disabled={!isRemoveEnabledForCompleted}
                        onClick={this.handleSavedRemoveButtonClick}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'removeAllCompletedButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleBulkRemoveButtonClick}
                        disabled={!isRemoveEnabledForAll}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'removeAllButtonTitle')}
                    </button>
                </DropdownMenu>
                <DropdownMenu
                    iconName={iconNames.save}
                    className={styles.saveButtons}
                    title={_ts('addLeads.actions', 'saveButtonTitle')}
                    closeOnClick
                >
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleSaveButtonClick}
                        disabled={isSaveDisabledForActive}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'saveCurrentButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleFilteredSaveButtonClick}
                        disabled={pendingSubmitAll || !isSaveEnabledForFiltered}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'saveAllFilteredButtonTitle')}
                    </button>
                    <button
                        className={styles.dropdownButton}
                        onClick={this.handleBulkSaveButtonClick}
                        disabled={pendingSubmitAll || !isSaveEnabledForAll}
                        type="button"
                    >
                        {_ts('addLeads.actions', 'saveAllButtonTitle')}
                    </button>
                </DropdownMenu>
            </div>
        );
    }
}
