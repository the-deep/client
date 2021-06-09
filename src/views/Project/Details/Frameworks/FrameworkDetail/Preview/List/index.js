import PropTypes from 'prop-types';
import React from 'react';
import Faram, { FaramGroup } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

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
        // eslint-disable-next-line react/forbid-prop-types
        widgets: PropTypes.array,
    }).isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: undefined,
};

const widgetLayoutSelector = (widget) => {
    const { properties: { listGridLayout } = {} } = widget;
    return listGridLayout;
};

const widgetKeySelector = widget => widget.key;
const emptyObject = {};

export default class List extends React.PureComponent {
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

        const widgetType = VIEW.list;

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
                        />
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }

    render() {
        const {
            framework: { widgets },
            className,
        } = this.props;

        const filteredWidgets = widgets.filter(
            w => hasWidgetTagComponent(
                w.widgetId,
                VIEW.list,
                w.properties.addedFrom,
            ),
        );

        return (
            <Faram
                className={_cs(className, styles.faram)}
                readOnly
                schema={emptyObject}
                value={emptyObject}
                error={emptyObject}
            >
                <GridViewLayout
                    data={filteredWidgets}
                    itemClassName={styles.widget}
                    itemContentModifier={this.renderWidgetContent}
                    itemHeaderModifier={this.renderWidgetHeader}
                    keySelector={widgetKeySelector}
                    layoutSelector={widgetLayoutSelector}
                />
            </Faram>
        );
    }
}
