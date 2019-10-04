import PropTypes from 'prop-types';
import React from 'react';

import LoadingAnimation from '#rscv/LoadingAnimation';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import SelectInput from '#rsci/SelectInput';

import {
    fetchWidget,
    widgetListingVisibility,
    widgetList,
    VIEW,
} from '#widgets';

import _ts from '#ts';

import WidgetList from '../WidgetList';
import WidgetEditor from '../WidgetEditor';

import styles from './styles.scss';

const overviewWidgets = widgetList.filter(
    w => widgetListingVisibility(w.widgetId, VIEW.overview),
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

export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderWidget = (key, widget) => {
        const {
            editComponent: Widget,
        } = fetchWidget(VIEW.overview, widget.widgetId);

        const {
            onWidgetSave,
            onWidgetChange,
            onWidgetCancel,
        } = this.props;

        return (
            <div className={styles.editWidgetPane}>
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
            <div className={styles.overview}>
                {pending && <LoadingAnimation /> }
                { selectedWidgetKey ? (
                    this.renderWidget(selectedWidgetKey, temporaryWidgetState)
                ) : (
                    <WidgetList
                        className={styles.widgetList}
                        widgets={overviewWidgets}
                        widgetType={VIEW.overview}
                        analysisFrameworkId={analysisFrameworkId}
                    />
                )}
                <div className={styles.gridLayoutContainer}>
                    <div className={styles.header}>
                        <PrimaryButton
                            className={styles.button}
                            iconName="add"
                            disabled
                        />
                        <PrimaryButton
                            className={styles.button}
                            iconName="remove"
                            disabled
                        />
                        <SelectInput
                            className={styles.input}
                            placeholder={_ts('editFramework', 'dummyExcerptPlaceholder')}
                            disabled
                        />
                    </div>
                    <div className={styles.scrollWrapper}>
                        <WidgetEditor
                            widgets={widgets}
                            widgetType={VIEW.overview}
                            analysisFrameworkId={analysisFrameworkId}

                            onWidgetEditClick={onWidgetEditClick}
                            widgetsDisabled={widgetsDisabled}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
