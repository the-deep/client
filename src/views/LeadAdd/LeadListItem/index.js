import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    isDefined,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import Jumper from '#components/general/Jumper';

import _cs from '#cs';

import {
    LEAD_TYPE,
    LEAD_STATUS,
    leadKeySelector,
    leadSourceTypeSelector,
    leadFaramValuesSelector,
    leadIdSelector,

    isLeadExportDisabled,
    isLeadRemoveDisabled,
    isLeadSaveDisabled,
} from '../utils';

import styles from './styles.scss';

// FIXME: it doesn't make much sense to include the icon anymore
const leadTypeToIconClassMap = {
    [LEAD_TYPE.drive]: 'googleDrive',
    [LEAD_TYPE.dropbox]: 'dropbox',
    [LEAD_TYPE.file]: 'upload',
    [LEAD_TYPE.website]: 'globe',
    [LEAD_TYPE.text]: 'clipboard',
    [LEAD_TYPE.connectors]: 'link',
};

const styleMap = {
    [LEAD_STATUS.warning]: styles.warning,
    [LEAD_STATUS.requesting]: styles.pending,
    [LEAD_STATUS.uploading]: styles.pending,
    [LEAD_STATUS.invalid]: styles.error,
    [LEAD_STATUS.nonPristine]: styles.pristine,
    [LEAD_STATUS.complete]: styles.complete,
};

const iconMap = {
    [LEAD_STATUS.warning]: 'warning',
    [LEAD_STATUS.requesting]: 'loading',
    [LEAD_STATUS.uploading]: 'loading',
    [LEAD_STATUS.invalid]: 'error',
    [LEAD_STATUS.nonPristine]: 'codeWorking',
    [LEAD_STATUS.complete]: 'checkCircle',
};

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    lead: PropTypes.object.isRequired,
    leadState: PropTypes.string,

    onLeadSelect: PropTypes.func.isRequired,
    onLeadRemove: PropTypes.func.isRequired,
    onLeadExport: PropTypes.func.isRequired,
    onLeadSave: PropTypes.func.isRequired,
    active: PropTypes.bool,
};

const defaultProps = {
    active: false,
    className: undefined,
    leadState: undefined,
};

function LeadListItem(props) {
    const {
        lead,
        onLeadSelect,
        onLeadSave,
        onLeadRemove,
        onLeadExport,
        active,
        className,
        leadState,
    } = props;

    const handleClick = useCallback(() => {
        const leadKey = leadKeySelector(lead);
        onLeadSelect(leadKey);
    }, [onLeadSelect, lead]);

    const handleSaveClick = useCallback(() => {
        const leadKey = leadKeySelector(lead);
        onLeadSave(leadKey);
    }, [onLeadSave, lead]);

    const handleRemoveClick = useCallback(() => {
        const leadKey = leadKeySelector(lead);
        onLeadRemove(leadKey);
    }, [onLeadRemove, lead]);

    const handleExportClick = useCallback(() => {
        const leadId = leadIdSelector(lead);
        onLeadExport(leadId);
    }, [onLeadExport, lead]);

    const type = leadSourceTypeSelector(lead);
    const { title } = leadFaramValuesSelector(lead);

    const stateIconClassName = _cs(
        styles.statusIcon,
        styleMap[leadState],
    );

    const exportShown = isDefined(leadIdSelector(lead));

    const exportDisabled = isLeadExportDisabled(leadState);
    const removeDisabled = isLeadRemoveDisabled(leadState);
    const saveDisabled = isLeadSaveDisabled(leadState);

    // TODO: STYLING loading doesn't rotate
    return (
        <Jumper
            active={active}
            className={styles.leadListItem}
        >
            <button
                className={
                    _cs(
                        className,
                        styles.addLeadListItem,
                        active && styles.active,
                    )
                }
                onClick={handleClick}
                type="button"
            >
                <Icon
                    className={styles.icon}
                    name={leadTypeToIconClassMap[type]}
                />
                <span className={styles.title} >
                    { title }
                </span>
                <Icon
                    className={stateIconClassName}
                    name={iconMap[leadState]}
                />
            </button>
            <div className={styles.buttonContainer}>
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
            </div>
        </Jumper>
    );
}

LeadListItem.propTypes = propTypes;
LeadListItem.defaultProps = defaultProps;

export default LeadListItem;
