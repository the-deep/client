import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { isNotDefined } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';

import Jumper from '#components/general/Jumper';

import _cs from '#cs';

import {
    LEAD_TYPE,
    LEAD_STATUS,
    leadKeySelector,
    leadSourceTypeSelector,
    leadFaramValuesSelector,
} from '../utils';

import styles from './styles.scss';

const UploadProgress = ({ progress }) => {
    const hide = isNotDefined(progress) || progress === 100;

    const className = _cs(
        styles.progressBar,
        hide && styles.hide,
        progress === 100 && styles.completed,
    );

    const style = { width: `${progress || 0}%` };

    return (
        <span className={className}>
            <span
                className={styles.progress}
                style={style}
            />
        </span>
    );
};
UploadProgress.propTypes = {
    progress: PropTypes.number,
};
UploadProgress.defaultProps = {
    progress: undefined,
};

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
    active: PropTypes.bool,
    actionButtons: PropTypes.node,

    progress: PropTypes.number,
};

const defaultProps = {
    active: false,
    progress: undefined,
    className: undefined,
    leadState: undefined,
    actionButtons: undefined,
};

function LeadListItem(props) {
    const {
        lead,
        onLeadSelect,
        actionButtons,
        active,
        className,
        progress,
        leadState,
    } = props;

    const handleClick = useCallback(() => {
        const leadKey = leadKeySelector(lead);
        onLeadSelect(leadKey);
    }, [onLeadSelect, lead]);

    const type = leadSourceTypeSelector(lead);
    const { title } = leadFaramValuesSelector(lead);

    const stateIconClassName = _cs(
        styles.statusIcon,
        styleMap[leadState],
    );

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
                {actionButtons}
            </div>
            <UploadProgress
                progress={progress}
            />
        </Jumper>
    );
}

LeadListItem.propTypes = propTypes;
LeadListItem.defaultProps = defaultProps;

export default LeadListItem;
