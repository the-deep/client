import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import { iconNames } from '#constants';
import _ts from '#ts';

import ConditionsEditModal from '../ConditionsEdit';
import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
};

// eslint-disable-next-line react/prefer-stateless-function
export default class SelectedWidgetItem extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = { conditionsEditModalShow: false };
    }

    handleEditConditonsClick = () => {
        this.setState({ conditionsEditModalShow: true });
    }

    renderConditionsEditModal = () => {
        const { conditionsEditModalShow } = this.state;

        if (conditionsEditModalShow) {
            return (
                <ConditionsEditModal />
            );
        }

        return null;
    }

    render() {
        const {
            index,
            title,
        } = this.props;

        const ConditionsModal = this.renderConditionsEditModal;

        return (
            <div className={styles.inputContainer}>
                <div className={styles.title}>
                    {title}
                </div>
                <PrimaryButton
                    onClick={this.handleEditConditonsClick}
                    iconName={iconNames.edit}
                >
                    Edit Condition
                </PrimaryButton>
                <DangerButton
                    className={styles.deleteButton}
                    iconName={iconNames.delete}
                    faramAction="remove"
                    title={_ts('widgets.editor.multiselect', 'removeOptionButtonTitle')}
                    faramElementIndex={index}
                    transparent
                />
                <ConditionsModal />
            </div>
        );
    }
}
