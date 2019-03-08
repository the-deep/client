import PropTypes from 'prop-types';
import React from 'react';
import { FaramGroup } from '@togglecorp/faram';

import GridViewLayout from '#rscv/GridViewLayout';
import {
    VIEW,
    hasWidgetTagComponent,
    fetchWidgetTagComponent,
} from '#widgets';
import styles from './styles.scss';

const propTypes = {
    framework: PropTypes.shape({
        id: PropTypes.number,
        widgets: PropTypes.array,
    }).isRequired,
};

const defaultProps = {
};

const widgetLayoutSelector = (widget) => {
    const { properties: { overviewGridLayout } = {} } = widget;
    return overviewGridLayout;
};

const widgetKeySelector = widget => widget.key;

export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderWidgetHeader = (widget) => {
        const { title } = widget;

        const headingClassName = `
            ${styles.heading}
        `;

        return (
            <div className={styles.header}>
                <h5
                    title={title}
                    className={headingClassName}
                >
                    { title }
                </h5>
            </div>
        );
    }

    renderWidgetContent = (widget) => {
        const {
            widgetId,
            properties: { addedFrom },
            id,
        } = widget;

        const widgetType = VIEW.overview;

        const Widget = fetchWidgetTagComponent(
            widgetId,
            widgetType,
            addedFrom,
        );

        return (
            // eslint-disable-next-line css-modules/no-undef-class
            <div className={styles.content}>
                <FaramGroup faramElementName={String(id)}>
                    <FaramGroup faramElementName="data">
                        <Widget
                            widgetName={widgetId}
                            widgetType={widgetType}
                            widget={widget}

                            entryType="excerpt"
                            excerpt=""
                            image={undefined}
                            tabularField={undefined}
                            tabularFieldData={undefined}

                            disabled
                        />
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }

    render() {
        const {
            framework: { widgets },
        } = this.props;

        const filteredWidgets = widgets.filter(
            w => hasWidgetTagComponent(
                w.widgetId,
                VIEW.overview,
                w.properties.addedFrom,
            ),
        );

        return (
            <div className={styles.overview}>
                <GridViewLayout
                    data={filteredWidgets}
                    itemClassName={styles.widget}
                    itemContentModifier={this.renderWidgetContent}
                    itemHeaderModifier={this.renderWidgetHeader}
                    keySelector={widgetKeySelector}
                    layoutSelector={widgetLayoutSelector}
                />
            </div>
        );
    }
}
