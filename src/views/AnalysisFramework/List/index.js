import PropTypes from 'prop-types';
import React from 'react';

import {
    listWidgets,
    hasWidget,
} from '../widgets';
import WidgetList from '../WidgetList';
import WidgetEditor from '../WidgetEditor';

import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default class List extends React.PureComponent {
    static propTypes = propTypes;

    static widgetType = 'list'

    static filterWidgets = widgets => widgets.filter(
        widget => hasWidget(List.widgetType, widget.widgetId),
    );

    static layoutSelector = (widget) => {
        const { properties: { overviewGridLayout } = {} } = widget;
        return overviewGridLayout;
    }

    static keySelector = widget => widget.key;

    constructor(props) {
        super(props);

        const { analysisFramework: { widgets = [] } = {} } = this.props;
        this.widgets = List.filterWidgets(widgets);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            const { analysisFramework: { widgets = [] } = {} } = nextProps;
            this.widgets = List.filterWidgets(widgets);
        }
    }


    render() {
        const {
            analysisFramework: {
                id: analysisFrameworkId,
            },
        } = this.props;

        return (
            <div className={styles.list}>
                <div className={styles.gridLayoutWrapper}>
                    <WidgetEditor
                        widgets={this.widgets}
                        widgetType={List.widgetType}
                        analysisFrameworkId={analysisFrameworkId}
                    />
                </div>
                <WidgetList
                    className={styles.widgetList}
                    widgets={listWidgets}
                    widgetType={List.widgetType}
                    analysisFrameworkId={analysisFrameworkId}
                />
            </div>
        );
    }
}
