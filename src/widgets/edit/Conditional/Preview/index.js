import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import MultiViewContainer from '#rscv/MultiViewContainer';
import ScrollTabs from '#rscv/ScrollTabs';

import { fetchWidgetTagComponent } from '#widgets';

const propTypes = {
    widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widgetType: PropTypes.string.isRequired,
};

const defaultProps = {
};

const emptyObject = {};

export default class ConditionalFrameworkPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getWidgets = memoize(widget => (
        ((widget.properties || emptyObject).data || emptyObject).widgets
    ));

    constructor(props) {
        super(props);
        const { widget } = this.props;

        const widgets = ConditionalFrameworkPreview.getWidgets(widget);
        const tabs = this.getWidgetTabs(widgets);
        const tabsMap = Object.keys(tabs);
        this.state = { currentWidget: tabsMap[0] };
    }

    componentWillReceiveProps(nextProps) {
        const { widget: newWidget } = nextProps;
        const { widget: oldWidget } = this.props;

        const newWidgets = ConditionalFrameworkPreview.getWidgets(newWidget);
        const oldWidgets = ConditionalFrameworkPreview.getWidgets(oldWidget);

        if (oldWidgets !== newWidgets) {
            const tabs = this.getWidgetTabs(newWidgets);
            const tabsMap = Object.keys(tabs);
            this.setState({ currentWidget: tabsMap[0] });
        }
    }

    getWidgetViews = memoize((widgets) => {
        if (!widgets) {
            return emptyObject;
        }

        const views = {};

        widgets.forEach((w) => {
            const view = {
                component: () => {
                    const { widgetId } = w.widget;
                    const { widget: { properties: { addedFrom } }, widgetType } = this.props;

                    const Widget = fetchWidgetTagComponent(widgetId, widgetType, addedFrom);

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
    })

    getWidgetTabs = memoize((widgets) => {
        if (!widgets) {
            return emptyObject;
        }

        const tabs = widgets.reduce(
            (acc, w) => ({
                ...acc,
                [w.widget.key]: w.widget.title,
            }),
            {},
        );
        return tabs;
    })

    handleTabSelect = (currentWidget) => {
        this.setState({ currentWidget });
    }

    render() {
        const { currentWidget } = this.state;
        const { widget } = this.props;

        const widgets = ConditionalFrameworkPreview.getWidgets(widget);
        const widgetViews = this.getWidgetViews(widgets);
        const tabs = this.getWidgetTabs(widgets);

        return (
            <div>
                <ScrollTabs
                    tabs={tabs}
                    active={currentWidget}
                    onClick={this.handleTabSelect}
                />
                <MultiViewContainer
                    views={widgetViews}
                    active={currentWidget}
                />
            </div>
        );
    }
}
