import PropTypes from 'prop-types';
import React from 'react';
import GridViewLayout from '#rscv/GridViewLayout';

import {
    fetchWidget,
    VIEW,
} from '#widgets';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    entry: PropTypes.object.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    widgets: PropTypes.array.isRequired,
};

const defaultProps = {
    className: '',
};

const widgetLayoutSelector = (widget) => {
    const {
        properties: {
            listGridLayout,
        } = {},
    } = widget;
    return listGridLayout;
};

const widgetKeySelector = widget => widget.key;

export default class Entry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;


    renderWidgetHeader = (widget) => {
        const { title } = widget;

        const className = `
            ${styles.header}
        `;

        return (
            <div className={className}>
                <h5 className={styles.heading}>
                    { title }
                </h5>
            </div>
        );
    }

    renderWidgetContent = (widget) => {
        const {
            widgetId,
            id,
        } = widget;

        const { viewComponent: Widget } = fetchWidget(VIEW.list, widgetId);
        const {
            entry: {
                entryType,
                excerpt,
                image,
                attributes: {
                    [id]: {
                        data,
                    } = {},
                } = {},
            },
        } = this.props;

        if (widgetId === 'excerptWidget') {
            return (
                <Widget
                    className={styles.content}
                    entryType={entryType}
                    excerpt={excerpt}
                    image={image}
                    widget={widget}
                    data={data}
                />
            );
        }

        return (
            <Widget
                className={styles.content}
                widget={widget}
                data={data}
            />
        );
    }

    render() {
        const {
            className: classNameFromProps,
            widgets,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.entry}
        `;

        return (
            <GridViewLayout
                className={className}
                data={widgets}
                layoutSelector={widgetLayoutSelector}
                itemHeaderModifier={this.renderWidgetHeader}
                itemContentModifier={this.renderWidgetContent}
                keySelector={widgetKeySelector}
                itemClassName={styles.widget}
            />
        );
    }
}
