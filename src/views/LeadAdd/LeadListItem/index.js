import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { isDefined, bound } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';

import Jumper from '#components/general/Jumper';
import Badge from '#components/viewer/Badge';

import _cs from '#cs';

import {
    LEAD_TYPE,
    LEAD_STATUS,
} from '../utils';

import styles from './styles.scss';

function UploadProgress({ progress = 0, className: classNameFromProps }) {
    const className = _cs(
        styles.progressBar,
        classNameFromProps,
    );

    const style = { width: `${bound(progress, 0, 100)}%` };

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
    className: PropTypes.string,
};
UploadProgress.defaultProps = {
    progress: undefined,
    className: undefined,
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
    indent: PropTypes.number,
    separator: PropTypes.bool,
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
    indent: undefined,
    separator: true,
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
        indent,
        separator,
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
                        separator && styles.separator,
                    )
                }
                onClick={handleClick}
                type="button"
            >
                {indent && (
                    <span
                        style={{
                            width: `calc(${indent} * var(--width-icon-large))`,
                            minHeight: '1px',
                            flexShrink: 0,
                        }}
                    />
                )}
                {leadTypeToIconClassMap[type] && (
                    <Icon
                        className={styles.icon}
                        name={leadTypeToIconClassMap[type]}
                    />
                )}
                <span
                    className={styles.titleContainer}
                    title={title}
                >
                    {title}
                </span>
                {isDefined(count) && count > 0 && (
                    <Badge
                        className={styles.badge}
                        title={count}
                    />
                )}
                {isDefined(progress) && progress > 0 && progress < 100 ? (
                    <UploadProgress
                        className={styles.progress}
                        progress={progress}
                    />
                ) : (
                    <Icon
                        className={stateIconClassName}
                        name={iconMap[itemState]}
                    />
                )}
            </button>
            <div className={styles.buttonContainer}>
                {actionButtons}
            </div>
        </Jumper>
    );
}

LeadListItem.propTypes = propTypes;
LeadListItem.defaultProps = defaultProps;

export default LeadListItem;
