import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';

import { LEAD_TYPE, LEAD_STATUS } from '../../utils';
import styles from './styles.scss';

const leadTypeToIconClassMap = {
    [LEAD_TYPE.file]: 'upload',
    [LEAD_TYPE.website]: 'globe',
    [LEAD_TYPE.text]: 'clipboard',
    [LEAD_TYPE.drive]: 'googleDrive',
    [LEAD_TYPE.dropbox]: 'dropbox',
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

function LeadSource(props) {
    const {
        className,
        active,
        source,
        title,
        onClick,
        children,
        count,
        state,
    } = props;

    const handleClick = useCallback(() => {
        onClick(source);
    }, [onClick, source]);

    const stateIconClassName = _cs(
        styles.statusIcon,
        styleMap[state],
    );

    return (
        <div
            role="presentation"
            onClick={handleClick}
            className={
                _cs(
                    className,
                    styles.leadSource,
                    active && styles.active,
                )
            }
        >
            <Icon
                className={styles.icon}
                name={leadTypeToIconClassMap[source]}
            />
            <span className={styles.title} >
                { title }
            </span>
            {count > 0 && (
                <span className={styles.count}>
                    {count}
                </span>
            )}
            {state && (
                <Icon
                    className={stateIconClassName}
                    name={iconMap[state]}
                />
            )}
            <span className={styles.actions}>
                {children}
            </span>
        </div>
    );
}
LeadSource.propTypes = {
    className: PropTypes.string,
    active: PropTypes.bool,
    source: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node,
    count: PropTypes.number,
};
LeadSource.defaultProps = {
    className: undefined,
    active: false,
    children: undefined,
    count: 0,
};

export default LeadSource;
