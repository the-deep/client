import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import { connect } from 'react-redux';

import ListView from '#rscv/List/ListView';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import _ts from '#ts';

import {
    leadAddPageActiveSourceLeadsSelector,
    leadAddPageActiveLeadKeySelector,
    leadAddPageLeadFiltersSelector,

    leadAddSetActiveLeadKeyAction,
    leadAddNextLeadAction,
    leadAddPrevLeadAction,
} from '#redux';


import {
    isLeadExportDisabled,
    isLeadNextDisabled,
    isLeadPrevDisabled,
    isLeadRemoveDisabled,
    isLeadSaveDisabled,
    leadFilterMethod,
    leadIdSelector,
    leadKeySelector,

    leadSourceTypeSelector,
    leadFaramValuesSelector,
} from '../utils';

import DroppableDiv from './DroppableDiv';
import ListStatusItem from '../ListStatusItem';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    leads: PropTypes.array.isRequired,
    activeLeadKey: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    leadStates: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,

    onLeadRemove: PropTypes.func.isRequired,
    onLeadExport: PropTypes.func.isRequired,
    onLeadSave: PropTypes.func.isRequired,

    onLeadSelect: PropTypes.func.isRequired,
    onLeadNext: PropTypes.func.isRequired,
    onLeadPrev: PropTypes.func.isRequired,
};

const defaultProps = {
    activeLeadKey: undefined,
    className: undefined,
};

function LeadList(props) {
    const {
        activeLeadKey,
        className,
        leadStates,
        leads,
        filters,
        onLeadExport,
        onLeadNext,
        onLeadPrev,
        onLeadRemove,
        onLeadSave,
        onLeadSelect,
    } = props;

    const filteredLeads = useMemo(
        () => (
            leads.filter(
                (lead) => {
                    const key = leadKeySelector(lead);
                    const leadState = leadStates[key];
                    return leadFilterMethod(lead, filters, leadState);
                },
            )
        ),
        [filters, leadStates, leads],
    );

    const leadPrevDisabled = isLeadPrevDisabled(leads, activeLeadKey);
    const leadNextDisabled = isLeadNextDisabled(leads, activeLeadKey);

    const rendererParams = useCallback(
        (key, lead) => {
            const leadState = leadStates[key];
            const leadId = leadIdSelector(lead);
            const exportShown = isDefined(leadId);

            const exportDisabled = isLeadExportDisabled(leadState);
            const removeDisabled = isLeadRemoveDisabled(leadState);
            const saveDisabled = isLeadSaveDisabled(leadState);

            const handleExportClick = () => onLeadExport(leadId);
            const handleRemoveClick = () => onLeadRemove(key);
            const handleSaveClick = () => onLeadSave(key);

            const actionButtons = (
                <>
                    {exportShown && (
                        <Button
                            className={styles.button}
                            disabled={exportDisabled}
                            onClick={handleExportClick}
                            iconName="openLink"
                        />
                    )}
                    <Button
                        className={styles.button}
                        disabled={removeDisabled}
                        onClick={handleRemoveClick}
                        iconName="delete"
                    />
                    <PrimaryButton
                        className={styles.button}
                        disabled={saveDisabled}
                        onClick={handleSaveClick}
                        iconName="save"
                    />
                </>
            );

            return {
                itemKey: key,
                active: key === activeLeadKey,
                title: leadFaramValuesSelector(lead)?.title,
                type: leadSourceTypeSelector(lead),
                onItemSelect: onLeadSelect,
                itemState: leadStates[key],
                actionButtons,
            };
        },
        [activeLeadKey, onLeadSelect, onLeadRemove, onLeadExport, onLeadSave, leadStates],
    );

    return (
        <DroppableDiv
            className={_cs(styles.leadListContainer, className)}
        >
            <ListView
                className={styles.leadList}
                data={filteredLeads}
                keySelector={leadKeySelector}
                renderer={ListStatusItem}
                rendererParams={rendererParams}
            />
            <div className={styles.movementButtons}>
                <div className={styles.stats}>
                    {/* FIXME: use strings */}
                    {leads.length === filteredLeads.length
                        ? `${leads.length} leads`
                        : `Showing ${filteredLeads.length} of ${leads.length} leads`
                    }
                </div>
                <div className={styles.actions}>
                    <Button
                        disabled={leadPrevDisabled}
                        onClick={onLeadPrev}
                        iconName="prev"
                        title={_ts('addLeads.actions', 'previousButtonLabel')}
                    />
                    <Button
                        disabled={leadNextDisabled}
                        onClick={onLeadNext}
                        iconName="next"
                        title={_ts('addLeads.actions', 'nextButtonLabel')}
                    />
                </div>
            </div>
        </DroppableDiv>
    );
}
LeadList.propTypes = propTypes;
LeadList.defaultProps = defaultProps;

const mapStateToProps = state => ({
    leads: leadAddPageActiveSourceLeadsSelector(state),
    filters: leadAddPageLeadFiltersSelector(state),
    activeLeadKey: leadAddPageActiveLeadKeySelector(state),
});

const mapDispatchToProps = dispatch => ({
    onLeadSelect: params => dispatch(leadAddSetActiveLeadKeyAction(params)),
    onLeadNext: params => dispatch(leadAddNextLeadAction(params)),
    onLeadPrev: params => dispatch(leadAddPrevLeadAction(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LeadList);
