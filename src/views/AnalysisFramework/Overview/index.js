import PropTypes from 'prop-types';
import React from 'react';

import LoadingAnimation from '#rscv/LoadingAnimation';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import SelectInput from '#rsci/SelectInput';

import {
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
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
};

const defaultProps = {
    pending: false,
};

export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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
                        />
                    </div>
                </div>
            </div>
        );
    }
}
