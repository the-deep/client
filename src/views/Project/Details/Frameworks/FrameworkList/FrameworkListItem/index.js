import PropTypes from 'prop-types';
import React from 'react';
import Icon from '#rscg/Icon';
import { _cs } from '@togglecorp/fujs';

import ListItem from '#rscv/List/ListItem';

import styles from './styles.scss';

const FrameworkListItem = ({
    className,
    isActive,
    isSelected,
    framework: { title },
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
    }),
    onClick: PropTypes.func.isRequired,
};

FrameworkListItem.defaultProps = {
    className: '',
    framework: {},
};

export default FrameworkListItem;
