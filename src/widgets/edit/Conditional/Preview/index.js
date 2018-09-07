import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import MultiViewContainer from '#rscv/MultiViewContainer';
import FixedTabs from '#rscv/FixedTabs';

import { fetchWidgetTagComponent } from '#widgets';

const propTypes = {
    widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widgetType: PropTypes.string.isRequired,
};

const defaultProps = {
};

export default class ConditionalFrameworkPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getWidgets = memoize(widget => (
        ((widget.properties || {}).data || {}).widgets
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
        const { widget } = nextProps;

        const widgets = ConditionalFrameworkPreview.getWidgets(widget);
        const tabs = this.getWidgetTabs(widgets);
        const tabsMap = Object.keys(tabs);
        this.setState({ currentWidget: tabsMap[0] });
    }

    getWidgetViews = memoize((widgets) => {
        const views = {};
        if (!widgets) {
            return {};
        }
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
            return {};
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
                <FixedTabs
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
