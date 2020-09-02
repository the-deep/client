import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import AccentConfirmButton from '#rsca/ConfirmButton/AccentConfirmButton';
import WarningConfirmButton from '#rsca/ConfirmButton/WarningConfirmButton';

import _ts from '#ts';

import styles from './styles.scss';

function ApplyAll({
    className,
    disabled,
    children,
    hidden,
    identifierName,
    onApplyAllClick,
    onApplyAllBelowClick,
    extraButtons,
}) {
    return (
        <div className={_cs(styles.applyInput, className)}>
            { children }
            <div className={styles.applyButtons}>
                { extraButtons }
                {!hidden && (
                    <>
                        <AccentConfirmButton
                            className={styles.applyButton}
                            transparent
                            title={_ts('addLeads', 'applyAllButtonTitle')}
                            disabled={disabled}
                            onClick={() => onApplyAllClick(identifierName)}
                            tabIndex="-1"
                            iconName="applyAll"
                            confirmationMessage={_ts('addLeads', 'applyToAll')}
                        />
                        <WarningConfirmButton
                            className={styles.applyButton}
                            transparent
                            title={_ts('addLeads', 'applyAllBelowButtonTitle')}
                            disabled={disabled}
                            onClick={() => onApplyAllBelowClick(identifierName)}
                            tabIndex="-1"
                            iconName="applyAllBelow"
                            confirmationMessage={_ts('addLeads', 'applyToAllBelow')}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

ApplyAll.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    hidden: PropTypes.bool,
    children: PropTypes.node.isRequired,
    identifierName: PropTypes.string.isRequired,
    onApplyAllClick: PropTypes.func.isRequired,
    onApplyAllBelowClick: PropTypes.func.isRequired,
    extraButtons: PropTypes.node,
};

ApplyAll.defaultProps = {
    className: '',
    extraButtons: undefined,
    hidden: false,
};

export default ApplyAll;
