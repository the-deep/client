import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import PropTypes from 'prop-types';

import ListView from '#rscv/List/ListView';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import _ts from '#ts';

import { LEAD_TYPE } from '../utils';

import ListStatusItem from '../ListStatusItem';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    leads: PropTypes.array,
    activeLeadKey: PropTypes.number,
    onLeadSelect: PropTypes.func.isRequired,
    className: PropTypes.string,
    pending: PropTypes.bool,
};

const defaultProps = {
    activeLeadKey: undefined,
    className: undefined,
    leads: [],
    pending: false,
};

function LeadList(props) {
    const {
        activeLeadKey,
        leads,
        onLeadSelect,
        className,
        pending,
    } = props;

    const rendererParams = useCallback(
        (key, data) => {
            const actionButtons = (
                <>
                    <Button
                        className={styles.button}
                        disabled
                        iconName="delete"
                        // FIXME: use strings
                        title="block/unblock"
                    />
                    <PrimaryButton
                        className={styles.button}
                        disabled
                        iconName="save"
                        // FIXME: use strings
                        title="load"
                    />
                </>
            );

            return {
                itemKey: key,
                active: key === activeLeadKey,
                // FIXME: check if this is always available
                // FIXME: use lead.data.url or lead.url
                title: data.lead.data.title ?? data.lead.url,
                type: LEAD_TYPE.connectors,
                onItemSelect: onLeadSelect,
                // FIXME: identify bad states
                // itemState: leadStates[key],
                actionButtons,
            };
        },
        [activeLeadKey, onLeadSelect],
    );

    return (
        <div className={_cs(styles.leadListContainer, className)}>
            <ListView
                className={styles.leadList}
                data={leads}
                keySelector={item => item.id}
                renderer={ListStatusItem}
                rendererParams={rendererParams}
                pending={pending}
            />
            <div className={styles.movementButtons}>
                <div className={styles.stats}>
                    {/* FIXME: use strings */}
                    {`${leads.length} leads`}
                </div>
                <div className={styles.actions}>
                    <Button
                        disabled
                        iconName="prev"
                        title={_ts('addLeads.actions', 'previousButtonLabel')}
                    />
                    <Button
                        disabled
                        iconName="next"
                        title={_ts('addLeads.actions', 'nextButtonLabel')}
                    />
                </div>
            </div>
        </div>
    );
}
LeadList.propTypes = propTypes;
LeadList.defaultProps = defaultProps;

export default LeadList;
