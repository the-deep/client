import PropTypes from 'prop-types';
import React from 'react';

import {
    overviewWidgets,
    hasWidget,
} from '../widgets';
import WidgetList from '../WidgetList';
import WidgetEditor from '../WidgetEditor';

import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default class Overview extends React.PureComponent {
    static propTypes = propTypes;

    static widgetType = 'overview'

    static filterWidgets = widgets => widgets.filter(
        widget => hasWidget(Overview.widgetType, widget.widgetId),
    );

    static layoutSelector = (widget) => {
        const { properties: { overviewGridLayout } = {} } = widget;
        return overviewGridLayout;
    }

    static keySelector = widget => widget.key;

    constructor(props) {
        super(props);

        const { analysisFramework: { widgets = [] } = {} } = this.props;
        this.widgets = Overview.filterWidgets(widgets);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            const { analysisFramework: { widgets = [] } = {} } = nextProps;
            this.widgets = Overview.filterWidgets(widgets);
        }
    }

    render() {
        const {
            analysisFramework: {
                id: analysisFrameworkId,
            },
        } = this.props;

        return (
            <div className={styles.overview}>
                <WidgetList
                    className={styles.widgetList}
                    widgets={overviewWidgets}
                    widgetType={Overview.widgetType}
                    analysisFrameworkId={analysisFrameworkId}
                />
                <div className={styles.gridLayoutContainer}>
                    <div className={styles.scrollWrapper}>
                        <WidgetEditor
                            widgets={this.widgets}
                            widgetType={Overview.widgetType}
                            analysisFrameworkId={analysisFrameworkId}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
