import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import { iconNames } from '#constants';
import FrameworkEditButton from '#components/FrameworkEditButton';
import _ts from '#ts';

import {
    fetchWidget,
} from '#widgets';
import ConditionsEditModal from '../ConditionsEdit';
import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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

    handleItemChange = (newValues) => {
        console.warn(newValues);
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
            widget,
        } = this.props;
        const {
            title,
            widgetId,
        } = widget;

        const ConditionsModal = this.renderConditionsEditModal;
        const { editComponent: Widget } = fetchWidget('list', widgetId);

        return (
            <div className={styles.inputContainer}>
                <div className={styles.title}>
                    {title}
                </div>
                <PrimaryButton
                    onClick={this.handleEditConditonsClick}
                    iconName={iconNames.edit}
                >
                    {/* FIXME: Use strings */}
                    Edit Condition
                </PrimaryButton>
                <FrameworkEditButton
                    faramElementName={String(index)}
                    renderer={Widget}
                />
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
