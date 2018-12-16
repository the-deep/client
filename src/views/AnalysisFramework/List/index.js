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

const propTypes = {
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
};

const defaultProps = {
    pending: false,
};

const listWidgets = widgetList.filter(
    w => widgetListingVisibility(w.widgetId, VIEW.list),
);

export default class List extends React.PureComponent {
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
            <div className={styles.list}>
                { pending && <LoadingAnimation /> }
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
