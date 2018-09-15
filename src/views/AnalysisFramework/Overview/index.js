import PropTypes from 'prop-types';
import React from 'react';

import TextInput from '#rsci/TextInput';
import Label from '#rsci/Label';
import TextArea from '#rsci/TextArea';

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
                    <header className={styles.header}>
                        <TextInput
                            className={styles.nameInput}
                            label={_ts('project', 'addAfTitleLabel')}
                            faramElementName="title"
                            placeholder={_ts('project', 'addAfTitlePlaceholder')}
                        />
                        <TextArea
                            className={styles.descriptionInput}
                            label={_ts('project', 'projectDescriptionLabel')}
                            faramElementName="description"
                            placeholder={_ts('project', 'projectDescriptionPlaceholder')}
                            rows={1}
                        />
                    </header>
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
