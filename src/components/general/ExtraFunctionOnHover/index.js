import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const ExtraFunctionsOnHover = ({
    className,
    children,
    buttons,
}) => (
    <div className={_cs(styles.extraFunctionsInputContainer, className)}>
        { children }
        <div className={styles.buttons}>
            { buttons }
        </div>
    </div>
);

ExtraFunctionsOnHover.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    buttons: PropTypes.node,
};

ExtraFunctionsOnHover.defaultProps = {
    className: '',
    buttons: undefined,
};

export default ExtraFunctionsOnHover;
