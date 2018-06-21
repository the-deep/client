import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ResizableH from '#rscv/Resizable/ResizableH';
// import List from '#rscv/List';


import {
    leadIdFromRoute,
    editEntriesSelectedEntryKeySelector,
    editEntriesWidgetsSelector,
    editEntriesSelectedEntrySelector,
    editEntriesSetSelectedEntryKeyAction,
} from '#redux';

import WidgetFaram from '../WidgetFaram';
import { hasWidget } from '../widgets';

import LeadPane from './LeadPane';
import styles from './styles.scss';

const propTypes = {
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
};

const defaultProps = {
    entry: undefined,
    widgets: [],
    pending: false,
};


const mapStateToProps = state => ({
    widgets: editEntriesWidgetsSelector(state),
    entry: editEntriesSelectedEntrySelector(state),
});

@connect(mapStateToProps)
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static widgetType = 'overview'

    static filterWidgets = widgets => (
        widgets.filter(
            widget => hasWidget(Overview.widgetType, widget.widgetId),
        )
    )

    constructor(props) {
        super(props);
        this.widgets = Overview.filterWidgets(props.widgets);
    }

    componentWillReceiveProps(nextProps) {
        const { widgets: oldWidgets } = this.props;
        const { widgets: newWidgets } = nextProps;
        if (newWidgets !== oldWidgets) {
            this.widgets = Overview.filterWidgets(newWidgets);
        }
    }

    render() {
        const {
            pending,
            entry,
            widgets, // eslint-disable-line no-unused-vars

            ...otherProps
        } = this.props;

        return (
            <ResizableH
                className={styles.overview}
                leftChild={
                    <LeadPane />
                }
                rightChild={
                    <WidgetFaram
                        entry={entry}
                        widgets={this.widgets}
                        pending={pending}
                        widgetType={Overview.widgetType}
                        {...otherProps}
                    />
                }
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
            />
        );
    }
}
