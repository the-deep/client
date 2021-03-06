import PropTypes from 'prop-types';
import React from 'react';

import LoadingAnimation from '#rscv/LoadingAnimation';
import {
    fetchWidget,
    widgetListingVisibility,
    widgetList,
    VIEW,
} from '#widgets';
import WidgetList from '../WidgetList';
import WidgetEditor from '../WidgetEditor';

import styles from './styles.scss';

const listWidgets = widgetList.filter(
    w => widgetListingVisibility(w.widgetId, VIEW.list),
);

const propTypes = {
    analysisFrameworkId: PropTypes.number.isRequired,
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,

    onWidgetSave: PropTypes.func.isRequired,
    onWidgetChange: PropTypes.func.isRequired,
    onWidgetCancel: PropTypes.func.isRequired,
    onWidgetEditClick: PropTypes.func.isRequired,
    widgetsDisabled: PropTypes.bool,
    selectedWidgetKey: PropTypes.string,
    temporaryWidgetState: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    widgets: [],
    pending: false,
    widgetsDisabled: false,
    selectedWidgetKey: undefined,
    temporaryWidgetState: undefined,
};

export default class List extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderWidget = (key, widget) => {
        const {
            editComponent: Widget,
        } = fetchWidget(VIEW.list, widget.widgetId);
        const {
            onWidgetSave,
            onWidgetChange,
            onWidgetCancel,
        } = this.props;
        return (
            <div className={styles.widgetList}>
                <Widget
                    widgetKey={widget.key}
                    title={widget.title}
                    data={widget.properties.data}
                    properties={widget.properties}

                    onSave={onWidgetSave}
                    onChange={onWidgetChange}
                    closeModal={onWidgetCancel}
                />
            </div>
        );
    }

    render() {
        const {
            analysisFrameworkId,
            widgets,
            pending,

            widgetsDisabled,
            selectedWidgetKey,
            temporaryWidgetState,

            onWidgetEditClick,
        } = this.props;

        return (
            <div className={styles.list}>
                { pending && <LoadingAnimation /> }
                <div className={styles.gridLayoutWrapper}>
                    <WidgetEditor
                        widgets={widgets}
                        widgetType={VIEW.list}
                        analysisFrameworkId={analysisFrameworkId}

                        onWidgetEditClick={onWidgetEditClick}
                        widgetsDisabled={widgetsDisabled}
                    />
                </div>
                { selectedWidgetKey ? (
                    this.renderWidget(selectedWidgetKey, temporaryWidgetState)
                ) : (
                    <WidgetList
                        className={styles.widgetList}
                        widgets={listWidgets}
                        widgetType={VIEW.list}
                        analysisFrameworkId={analysisFrameworkId}
                    />
                )}
            </div>
        );
    }
}
