import PropTypes from 'prop-types';
import React from 'react';
import Icon from '#rscg/Icon';
import { _cs } from '@togglecorp/fujs';

import ListItem from '#rscv/List/ListItem';
import Badge from '#components/viewer/Badge';

import _ts from '#ts';

import styles from './styles.scss';

const FrameworkListItem = ({
    className,
    isActive,
    isSelected,
    framework: {
        title,
        isPrivate,
    },
    onClick,
}) => (
    <ListItem
        className={_cs(styles.frameworkListItem, className)}
        active={isActive}
        onClick={onClick}
    >
        <div className={styles.title}>
            { title }
        </div>
        { isPrivate &&
            <Badge
                className={styles.badge}
                icon="locked"
                noBorder
                tooltip={_ts('framework', 'privateFrameworkBadgeTooltip')}
            />
        }
        { isSelected &&
            <Icon
                name="checkCircle"
                className={styles.check}
            />
        }
    </ListItem>
);

FrameworkListItem.propTypes = {
    className: PropTypes.string,
    isActive: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    framework: PropTypes.shape({
        title: PropTypes.string,
        isPrivate: PropTypes.bool,
    }),
    onClick: PropTypes.func.isRequired,
};

FrameworkListItem.defaultProps = {
    className: '',
    framework: {},
};

export default FrameworkListItem;
