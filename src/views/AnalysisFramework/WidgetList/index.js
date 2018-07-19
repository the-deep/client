import PropTypes from 'prop-types';
import React from 'react';

import ListView from '#rs/components/View/List/ListView';

import WidgetPreview from './WidgetPreview';
import styles from './styles.scss';

const propTypes = {
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    onAdd: PropTypes.func,
    className: PropTypes.string,
};
const defaultProps = {
    className: '',
    widgets: [],
    onAdd: () => {},
};

export default class WidgetList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = widget => widget.widgetId;

    rendererParams = (key, widget) => ({
        widget,
        widgetId: key,
        onAdd: this.props.onAdd,
    })

    render() {
        return (
            <ListView
                className={`${styles.widgetList} ${this.props.className}`}
                data={this.props.widgets}
                renderer={WidgetPreview}
                keyExtractor={WidgetList.keyExtractor}
                rendererParams={this.rendererParams}
            />
        );
    }
}
