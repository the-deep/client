import PropTypes from 'prop-types';
import React from 'react';

import LoadingAnimation from '#rscv/LoadingAnimation';

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
    pending: PropTypes.bool,
};

const defaultProps = {
    pending: false,
};

export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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
            pending,
        } = this.props;

        return (
            <div className={styles.overview}>
                { pending && <LoadingAnimation /> }
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
