import PropTypes from 'prop-types';
import React from 'react';

import Faram from '#rscg/Faram';
import FaramGroup from '#rscg/FaramGroup';
import GridViewLayout from '#rscv/GridViewLayout';
import LoadingAnimation from '#rscv/LoadingAnimation';

import { entryAccessor } from '#entities/editEntries';
import { iconNames } from '#constants';

import {
    fetchWidget,
    widgetVisibility,
    VIEW,
    VISIBILITY,
} from '#widgets';

import ErrorWrapper from '../ErrorWrapper';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    schema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    computeSchema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgetType: PropTypes.string.isRequired,
    pending: PropTypes.bool,

    onExcerptChange: PropTypes.func.isRequired,
    onExcerptCreate: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    actionComponent: PropTypes.func,
};

const defaultProps = {
    pending: false,
    className: '',
    entry: undefined,
    widgets: [],
    onChange: () => {},
    schema: {},
    computeSchema: {},
    actionComponent: undefined,
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
        return (widgetType === VIEW.list ? listGridLayout : overviewGridLayout);
    }

    renderWidgetHeader = (widget) => {
        const {
            actionComponent: ActionComponent,
            entry,
            widgetType,
        } = this.props;

        const {
            id,
            title,
        } = widget;

        const {
            data: { attributes: { [id]: { data } = {} } = {} } = {},
        } = entry || {};

        const isViewPage = widgetType === VIEW.list;

        const entryKey = entryAccessor.key(entry);

        const Header = ({ hasError, error }) => (
            <div
                className={`${styles.header} ${hasError ? styles.error : ''}`}
                title={error}
            >
                <h5 className={styles.heading}>
                    { hasError &&
                        <span className={iconNames.warning} />
                    }
                    { title }
                </h5>
                { ActionComponent && entry && isViewPage && (
                    <div className={styles.actionButtons}>
                        <ActionComponent
                            attributeKey={id}
                            attributeData={data}
                            entryKey={entryKey}
                        />
                    </div>
                )}
            </div>
        );

        return (
            <FaramGroup faramElementName={String(id)}>
                <ErrorWrapper
                    faramElementName="data"
                    renderer={Header}
                />
            </FaramGroup>
        );
    }

    renderWidgetContent = (widget) => {
        const {
            widgetType,
            entry,
        } = this.props;

        const {
            id,
            widgetId,
            properties: { addedFrom },
        } = widget;
        const {
            entryType,
            excerpt,
            image,
        } = entryAccessor.data(entry) || {};

        const {
            component: Widget,
            viewComponent: ViewWidget,
        } = fetchWidget(widgetType, widgetId);

        const secondary = widgetVisibility(
            widgetId,
            widgetType,
            addedFrom,
        ) === VISIBILITY.secondary;

        if (secondary) {
            // Faram not used for view component
            const {
                data: { attributes: { [id]: { data } = {} } = {} } = {},
            } = entry || {};

            return (
                <div className={styles.content}>
                    <ViewWidget
                        data={data}
                        widget={widget}
                    />
                </div>
            );
        }

        let child = null;
        switch (widgetId) {
            case 'excerptWidget': {
                child = (
                    <Widget
                        widgetName={widgetId}
                        widgetType={widgetType}
                        widget={widget}

                        entryType={entryType}
                        excerpt={excerpt}
                        image={image}
                        onExcerptChange={this.handleExcerptChange}
                        onExcerptCreate={this.handleExcerptCreate}
                    />
                );
                break;
            }
            case 'organigramWidget':
            case 'geoWidget': {
                child = (
                    <Widget
                        widgetName={widgetId}
                        widgetType={widgetType}
                        widget={widget}
                        entryType={entryType}
                        excerpt={excerpt}
                        image={image}
                    />
                );
                break;
            }
            default: {
                child = (
                    <Widget
                        widgetName={widgetId}
                        widgetType={widgetType}
                        widget={widget}
                    />
                );
                break;
            }
        }

        return (
            <div className={styles.content}>
                <FaramGroup faramElementName={String(id)}>
                    <FaramGroup faramElementName="data">
                        { child }
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }

    render() {
        const {
            entry = {},
            widgets,
            className: classNameFromProps,
            schema,
            computeSchema,
            pending,
        } = this.props;

        const error = entryAccessor.error(entry);
        const className = `
            ${classNameFromProps}
            ${styles.widgetFaram}
            'widget-faram'
        `;

        const {
            data: { attributes } = {},
        } = entry;

        return (
            <Faram
                className={className}
                onChange={this.handleChange}
                schema={schema}
                computeSchema={computeSchema}
                value={attributes}
                error={error}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
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
