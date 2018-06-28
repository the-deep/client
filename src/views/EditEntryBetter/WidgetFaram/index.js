import PropTypes from 'prop-types';
import React from 'react';

import Faram from '#rs/components/Input/Faram';
import FaramGroup from '#rs/components/Input/Faram/FaramGroup';
import GridViewLayout from '#rs/components/View/GridViewLayout';

import { entryAccessor } from '#entities/editEntriesBetter';
import { fetchWidget } from '../widgets';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    schema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
    widgetType: PropTypes.string.isRequired,

    onExcerptChange: PropTypes.func.isRequired,
    onExcerptCreate: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    entry: undefined,
    widgets: [],
    pending: false,
    onChange: () => {},
    schema: {},
};

export default class WidgetFaram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = widget => widget.key

    // Faram

    handleChange = (faramValues, faramErrors, faramInfo) => {
        const entryKey = entryAccessor.key(this.props.entry);
        this.props.onChange(faramValues, faramErrors, faramInfo, entryKey);
    }

    handleExcerptChange = (excerptData) => {
        const entryKey = entryAccessor.key(this.props.entry);
        this.props.onExcerptChange(excerptData, entryKey);
    }

    handleExcerptCreate = (excerptData) => {
        this.props.onExcerptCreate(excerptData);
    }

    // Grid View Layout

    layoutSelector = (widget = {}) => {
        const { widgetType } = this.props;
        const {
            properties: {
                listGridLayout,
                overviewGridLayout,
            } = {},
        } = widget;
        return (widgetType === 'list' ? listGridLayout : overviewGridLayout);
    }

    renderWidgetHeader = (widget) => {
        const { title } = widget;
        return (
            <div className={styles.header}>
                { title }
            </div>
        );
    }

    renderWidgetContent = (widget) => {
        const {
            widgetType,
            entry,
        } = this.props;

        const { entryType, excerpt, image } = entryAccessor.data(entry) || {};
        const { id, widgetId } = widget;
        const Widget = fetchWidget(widgetType, widgetId);

        return (
            <div className={styles.content}>
                <FaramGroup faramElementName={String(id)}>
                    <FaramGroup faramElementName="data">
                        {
                            // NOTE: excerptWidget is a special case
                            widgetId === 'excerptWidget' ? (
                                <Widget
                                    entryType={entryType}
                                    excerpt={excerpt}
                                    image={image}
                                    widget={widget}
                                    onExcerptChange={this.handleExcerptChange}
                                    onExcerptCreate={this.handleExcerptCreate}
                                />
                            ) : (
                                <Widget
                                    widget={widget}
                                />
                            )
                        }
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }

    render() {
        const {
            entry = {},
            pending,
            widgets,
            className: classNameFromProps,
            schema,
        } = this.props;

        const error = entryAccessor.error(entry);
        const className = `
            ${classNameFromProps}
            ${styles.widgetFaram}
            'widget-faram'
        `;

        const {
            data: {
                attributes,
            } = {},
        } = entry;

        return (
            <Faram
                className={className}
                onChange={this.handleChange}
                // onValidationFailure={this.handleValidationFailure}
                // onValidationSuccess={this.handleValidationSuccess}
                schema={schema}
                value={attributes}
                error={error}
                disabled={pending}
            >
                <GridViewLayout
                    data={widgets}
                    layoutSelector={this.layoutSelector}
                    itemHeaderModifier={this.renderWidgetHeader}
                    itemContentModifier={this.renderWidgetContent}
                    keySelector={WidgetFaram.keySelector}
                    itemClassName={styles.widget}
                />
            </Faram>
        );
    }
}
