import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { isNotDefined } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';

import Jumper from '#components/general/Jumper';
import Badge from '#components/viewer/Badge';

import _cs from '#cs';

import {
    LEAD_TYPE,
    LEAD_STATUS,
} from '../utils';

import styles from './styles.scss';

function UploadProgress({ progress }) {
    const hide = isNotDefined(progress) || progress === 100 || progress < 0;

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
}
UploadProgress.propTypes = {
    progress: PropTypes.number,
};
UploadProgress.defaultProps = {
    progress: undefined,
};

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

    title: PropTypes.string.isRequired,
    itemState: PropTypes.string,
    type: PropTypes.string,
    itemKey: PropTypes.string.isRequired,

    onItemSelect: PropTypes.func,
    active: PropTypes.bool,
    actionButtons: PropTypes.node,

    progress: PropTypes.number,
    count: PropTypes.number,
};

const defaultProps = {
    active: false,
    progress: undefined,
    count: undefined,
    type: undefined,
    className: undefined,
    itemState: undefined,
    actionButtons: undefined,
    onItemSelect: undefined,
};

function LeadListItem(props) {
    const {
        itemKey,
        title,
        onItemSelect,
        actionButtons,
        active,
        className,
        progress,
        type,
        count,
        itemState,
    } = props;

    const handleClick = useCallback(() => {
        if (onItemSelect) {
            onItemSelect(itemKey);
        }
    }, [onItemSelect, itemKey]);

    const stateIconClassName = _cs(
        styles.statusIcon,
        styleMap[itemState],
    );

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
                <div className={styles.titleContainer}>
                    <span className={styles.title}>
                        {title}
                    </span>
                    {count && (
                        <Badge
                            className={styles.badge}
                            title={count}
                        />
                    )}
                </div>
                <Icon
                    className={stateIconClassName}
                    name={iconMap[itemState]}
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
