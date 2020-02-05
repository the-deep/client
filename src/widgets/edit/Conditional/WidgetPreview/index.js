import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    createNewElement: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widgetKey: PropTypes.string.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    className: undefined,
};

export default class WidgetPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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
            className,
            widgetKey,
        } = this.props;

        return (
            <div className={_cs(styles.widgetListItem, className)}>
                <div className={styles.title}>
                    {title}
                </div>
                <Button
                    transparent
                    faramAction={this.addRowClick}
                    faramElementName={`add-btn-${widgetKey}`}
                    iconName="add"
                    title={_ts('framework.widgetList', 'addWidgetButtonLabel')}
                />
            </div>
        );
    }
}

