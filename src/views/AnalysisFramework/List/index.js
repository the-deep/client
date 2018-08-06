import PropTypes from 'prop-types';
import React from 'react';

import {
    widgetListingVisibility,
    widgetList,
    VIEW,
} from '../widgets';
import WidgetList from '../WidgetList';
import WidgetEditor from '../WidgetEditor';

import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

console.warn(widgetList);

const listWidgets = widgetList.filter(
    w => widgetListingVisibility(w.widgetId, VIEW.list),
);

export default class List extends React.PureComponent {
    static propTypes = propTypes;

    static layoutSelector = (widget) => {
        const { properties: { overviewGridLayout } = {} } = widget;
        return overviewGridLayout;
    }

    static keySelector = widget => widget.key;

    render() {
        const {
            analysisFramework: {
                id: analysisFrameworkId,
                widgets,
            } = {},
        } = this.props;

        return (
            <div className={styles.list}>
                <div className={styles.gridLayoutWrapper}>
                    <WidgetEditor
                        widgets={widgets}
                        widgetType={VIEW.list}
                        analysisFrameworkId={analysisFrameworkId}
                    />
                </div>
                <WidgetList
                    className={styles.widgetList}
                    widgets={listWidgets}
                    widgetType={VIEW.list}
                    analysisFrameworkId={analysisFrameworkId}
                />
            </div>
        );
    }
}
