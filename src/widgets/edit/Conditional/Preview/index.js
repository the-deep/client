import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import MultiViewContainer from '#rscv/MultiViewContainer';
import FixedTabs from '#rscv/FixedTabs';

import {
    fetchWidget,
    VISIBILITY,
    widgetVisibility,
} from '#widgets';

import styles from './styles.scss';

const propTypes = {
    widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widgetType: PropTypes.string.isRequired,
};

const defaultProps = {
};

export default class ConditionalFrameworkPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getWidgets = widget => (
        ((widget.properties || {}).data || {}).widgets
    );

    constructor(props) {
        super(props);
        const { widget } = this.props;

        const widgets = ConditionalFrameworkPreview.getWidgets(widget);
        this.widgets = this.getWidgetViews(widgets);
        this.tabs = this.getWidgetTabs(widgets);
        const tabsMap = Object.keys(this.tabs);
        this.state = { currentWidget: tabsMap[0] };
    }

    componentWillReceiveProps(nextProps) {
        const { widget: oldWidget } = this.props;
        const { widget: newWidget } = nextProps;

        const oldWidgets = ConditionalFrameworkPreview.getWidgets(oldWidget);
        const newWidgets = ConditionalFrameworkPreview.getWidgets(newWidget);

        if (oldWidgets !== newWidgets) {
            this.widgets = this.getWidgetViews(newWidgets);
            this.tabs = this.getWidgetTabs(newWidgets);
        }
    }

    getWidgetViews = (widgets) => {
        const views = {};
        widgets.forEach((w) => {
            const view = {
                component: () => {
                    const { widgetId } = w.widget;
                    const { widget: { properties: { addedFrom } }, widgetType } = this.props;

                    const {
                        component,
                        viewComponent,
                    } = fetchWidget(widgetType, widgetId);

                    const notReadonly = widgetVisibility(
                        widgetId,
                        widgetType,
                        addedFrom,
                    ) !== VISIBILITY.readonly;

                    const Widget = notReadonly ? component : viewComponent;

                    return (
                        <Widget
                            widgetName={widgetId}
                            widgetType={widgetType}
                            widget={w.widget}

                            entryType="excerpt"
                            excerpt=""
                            image={undefined}

                            disabled
                        />
                    );
                },
                mount: true,
                lazyMount: true,
                wrapContainer: true,
            };
            views[w.widget.key] = view;
        });
        return views;
    }

    getWidgetTabs = widgets => (
        widgets.reduce(
            (tabs, w) => ({
                ...tabs,
                [w.widget.key]: w.widget.title,
            }),
            {},
        )
    )

    handleTabSelect = (currentWidget) => {
        this.setState({ currentWidget });
    }

    render() {
        const { currentWidget } = this.state;

        return (
            <div>
                <FixedTabs
                    tabs={this.tabs}
                    active={currentWidget}
                    onClick={this.handleTabSelect}
                />
                <MultiViewContainer
                    views={this.widgets}
                    active={currentWidget}
                />
            </div>
        );
    }
}
