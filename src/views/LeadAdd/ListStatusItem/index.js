import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    isNotDefined,
    isDefined,
    bound,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Button from '#rsca/Button';

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

    onItemClick: PropTypes.func,
    active: PropTypes.bool,
    actionButtons: PropTypes.node,

    onItemSelect: PropTypes.func,
    isItemSelected: PropTypes.bool,
    selectionMode: PropTypes.bool,
    logo: PropTypes.string,

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
    onItemClick: undefined,
    indent: undefined,
    onItemSelect: undefined,
    isItemSelected: false,
    separator: true,
    selectionMode: false,
    logo: undefined,
};

function ListStatusItem(props) {
    const {
        itemKey,
        title,
        onItemClick,
        actionButtons,
        active,
        className,
        progress,
        type,
        count,
        itemState,
        indent,
        separator,
        onItemSelect,
        isItemSelected,
        selectionMode,
        logo,
    } = props;

    const handleClick = useCallback(() => {
        if (onItemClick) {
            onItemClick(itemKey);
        }
    }, [onItemClick, itemKey]);

    const stateIconClassName = _cs(
        styles.statusIcon,
        styleMap[itemState],
    );

    const iconForSelectionButton = useMemo(() => {
        if (!selectionMode && !isItemSelected && leadTypeToIconClassMap[type]) {
            return leadTypeToIconClassMap[type];
        }
        return isItemSelected ? 'checkCircle' : 'circleOutline';
    }, [
        type,
        isItemSelected,
        selectionMode,
    ]);

    return (
        <Jumper
            active={active}
            className={styles.leadListItem}
        >
            <div
                className={
                    _cs(
                        className,
                        styles.addLeadListItem,
                        active && styles.active,
                        separator && styles.separator,
                        !!actionButtons && styles.hasHover,
                    )
                }
            >
                {indent && (
                    <div className={styles.indent} />
                )}
                {leadTypeToIconClassMap[type]
                        && isNotDefined(onItemSelect)
                        && isNotDefined(logo)
                    && (
                        <Icon
                            className={styles.icon}
                            name={leadTypeToIconClassMap[type]}
                        />
                    )
                }
                {leadTypeToIconClassMap[type]
                        && isNotDefined(onItemSelect)
                        && isDefined(logo)
                    && (
                        <img
                            className={styles.img}
                            alt=""
                            src={logo}
                        />
                    )
                }
                {isDefined(onItemSelect) && (
                    <Button
                        className={_cs(
                            styles.icon,
                            isItemSelected && styles.checkButton,
                        )}
                        onClick={onItemSelect}
                        iconName={iconForSelectionButton}
                        transparent
                    />
                )}
                <button
                    className={styles.titleContainerButton}
                    onClick={handleClick}
                    type="button"
                >
                    <div
                        className={styles.titleContainer}
                        title={title}
                    >
                        {title}
                    </div>
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
            </div>
            {actionButtons && (
                <div className={styles.actionContainer}>
                    {actionButtons}
                </div>
            )}
        </Jumper>
    );
}

ListStatusItem.propTypes = propTypes;
ListStatusItem.defaultProps = defaultProps;

export default ListStatusItem;
