import PropTypes from 'prop-types';
import React from 'react';

import {
    widgetListingVisibility,
    widgetList,
    VIEW,
} from '#widgets';

import WidgetList from '../WidgetList';
import WidgetEditor from '../WidgetEditor';

import styles from './styles.scss';

const overviewWidgets = widgetList.filter(
    w => widgetListingVisibility(w.widgetId, VIEW.overview),
);

const propTypes = {
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default class Overview extends React.PureComponent {
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
            <div className={styles.overview}>
                <WidgetList
                    className={styles.widgetList}
                    widgets={overviewWidgets}
                    widgetType={VIEW.overview}
                    analysisFrameworkId={analysisFrameworkId}
                />
                <div className={styles.gridLayoutContainer}>
                    <div className={styles.scrollWrapper}>
                        <WidgetEditor
                            widgets={widgets}
                            widgetType={VIEW.overview}
                            analysisFrameworkId={analysisFrameworkId}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
