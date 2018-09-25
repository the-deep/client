import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rsca/Button';

import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    createNewElement: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widgetKey: PropTypes.string.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default class WidgetPreview extends React.PureComponent {
    static propTypes = propTypes;

    addRowClick = (rows) => {
        const {
            createNewElement,
            widget,
        } = this.props;

        const newRow = createNewElement(widget);
        return [
            ...rows,
            newRow,
        ];
    }

    render() {
        const {
            title,
            widgetKey,
        } = this.props;

        return (
            <div className={styles.widgetListItem}>
                <div className={styles.title}>
                    {title}
                </div>
                <Button
                    transparent
                    faramAction={this.addRowClick}
                    faramElementName={`add-btn-${widgetKey}`}
                    iconName={iconNames.add}
                    title={_ts('framework.widgetList', 'addWidgetButtonLabel')}
                />
            </div>
        );
    }
}

