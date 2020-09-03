import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';

import { LEAD_TYPE } from '../../utils';
import styles from './styles.scss';

const leadTypeToIconClassMap = {
    [LEAD_TYPE.file]: 'upload',
    [LEAD_TYPE.website]: 'globe',
    [LEAD_TYPE.text]: 'clipboard',
    [LEAD_TYPE.drive]: 'googleDrive',
    [LEAD_TYPE.dropbox]: 'dropbox',
    [LEAD_TYPE.connectors]: 'link',
};

function LeadSource(props) {
    const {
        className,
        active,
        source,
        title,
        onClick,
        children,
    } = props;

    const handleClick = useCallback(() => {
        onClick(source);
    }, [onClick, source]);

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
};
LeadSource.defaultProps = {
    className: undefined,
    active: false,
    children: undefined,
};

export default LeadSource;
