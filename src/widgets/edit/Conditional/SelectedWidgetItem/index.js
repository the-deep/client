import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import FaramGroup from '#rscg/FaramGroup';

import { iconNames } from '#constants';
import FrameworkEditButton from '#components/FrameworkEditButton';
import _ts from '#ts';

import { fetchWidget } from '#widgets';

import ConditionsEditButton from '../ConditionsEdit/Button';
import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    item: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const deleteClick = (rows, index) => (
    rows.filter((row, ind) => ind !== index)
);

export default class SelectedWidgetItem extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const {
            index,
            item,
        } = this.props;

        const {
            widget: {
                title,
                widgetId,
            },
        } = item;

        const { editComponent: Widget } = fetchWidget('list', widgetId);

        return (
            <div className={styles.inputContainer}>
                <div className={styles.title}>
                    {title}
                </div>
                <FaramGroup faramElementName={String(index)}>
                    <FrameworkEditButton
                        faramElementName="widget"
                        renderer={Widget}
                    />
                    <ConditionsEditButton
                        widgetTitle={title}
                        faramElementName="conditions"
                    />
                </FaramGroup>
                <DangerButton
                    className={styles.deleteButton}
                    iconName={iconNames.delete}
                    title={_ts('widgets.editor.multiselect', 'removeOptionButtonTitle')}
                    faramElementName={index}
                    faramAction={deleteClick}
                    transparent
                />
            </div>
        );
    }
}
