import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import FaramGroup from '#rscg/FaramGroup';

import { iconNames } from '#constants';
import FrameworkEditButton from '#components/FrameworkEditButton';
import _ts from '#ts';

import {
    fetchWidget,
} from '#widgets';
import ConditionsEditButton from '../ConditionsEdit/Button';
import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    item: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onModalVisibilityChange: PropTypes.func,
};

const defaultProps = {
    onModalVisibilityChange: () => {},
};

const faramInfoForDelete = {
    action: 'remove',
};

export default class SelectedWidgetItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            index,
            item,
            onModalVisibilityChange,
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
                        onModalVisibilityChange={onModalVisibilityChange}
                        renderer={Widget}
                    />
                    <ConditionsEditButton
                        faramElementName="conditions"
                        onModalVisibilityChange={onModalVisibilityChange}
                    />
                </FaramGroup>
                <DangerButton
                    className={styles.deleteButton}
                    iconName={iconNames.delete}
                    title={_ts('widgets.editor.multiselect', 'removeOptionButtonTitle')}
                    faramElementIndex={index}
                    faramInfo={faramInfoForDelete}
                    transparent
                />
            </div>
        );
    }
}
