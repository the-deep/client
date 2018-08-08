import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rsca/Button';

import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onAdd: PropTypes.func,
};
const defaultProps = {
    onAdd: () => {},
};

export default class WidgetPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleAddClick = () => {
        const {
            onAdd,
            widget,
        } = this.props;
        onAdd(widget);
    }

    render() {
        const { widget } = this.props;
        return (
            <div className={styles.widgetListItem}>
                <div className={styles.title}>
                    {_ts('widgetTitle', widget.title)}
                </div>
                <Button
                    transparent
                    onClick={this.handleAddClick}
                    iconName={iconNames.add}
                    title={_ts('framework.widgetList', 'addWidgetButtonLabel')}
                />
            </div>
        );
    }
}

