import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rsca/Button';
import Checkbox from '#rsci/Checkbox';

import _ts from '#ts';

import styles from './styles.scss';

const defaultProps = {
    leadNextDisabled: true,
    leadPrevDisabled: true,
    leadPreviewHidden: false,
};

const propTypes = {
    leadNextDisabled: PropTypes.bool,
    leadPrevDisabled: PropTypes.bool,
    leadPreviewHidden: PropTypes.bool,
    onLeadNext: PropTypes.func.isRequired,
    onLeadPrev: PropTypes.func.isRequired,
    onLeadPreviewHiddenChange: PropTypes.func.isRequired,
};

export default class LeadActions extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    handleHideLeadPreviewChange = () => {
        const {
            onLeadPreviewHiddenChange,
            leadPreviewHidden,
        } = this.props;

        onLeadPreviewHiddenChange(!leadPreviewHidden);
    }

    render() {
        const {
            leadPreviewHidden,
            onLeadPrev,
            onLeadNext,
            leadPrevDisabled,
            leadNextDisabled,
        } = this.props;

        return (
            <div className={styles.actionButtons}>
                <Checkbox
                    value={!leadPreviewHidden}
                    onChange={this.handleHideLeadPreviewChange}
                    label={_ts('addLeads.actions', 'showLeadPreviewLabel')}
                />
                <div className={styles.movementButtons}>
                    <Button
                        disabled={leadPrevDisabled}
                        onClick={onLeadPrev}
                        iconName="prev"
                        title={_ts('addLeads.actions', 'previousButtonLabel')}
                    />
                    <Button
                        disabled={leadNextDisabled}
                        onClick={onLeadNext}
                        iconName="next"
                        title={_ts('addLeads.actions', 'nextButtonLabel')}
                    />
                </div>
            </div>
        );
    }
}
