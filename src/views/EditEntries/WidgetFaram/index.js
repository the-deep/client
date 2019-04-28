import PropTypes from 'prop-types';
import React from 'react';
import Faram, { FaramGroup } from '@togglecorp/faram';
import memoize from 'memoize-one';

import Icon from '#rscg/Icon';
import GridViewLayout from '#rscv/GridViewLayout';
import LoadingAnimation from '#rscv/LoadingAnimation';

import { entryAccessor } from '#entities/editEntries';

import {
    VIEW,
    hasWidgetTagComponent,
    fetchWidgetTagComponent,
} from '#widgets';

import WidgetContentWrapper from './WidgetContentWrapper';
import ErrorWrapper from '../ErrorWrapper';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    tabularData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    schema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    computeSchema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgetType: PropTypes.string.isRequired,
    pending: PropTypes.bool,
    disabled: PropTypes.bool,

    onExcerptChange: PropTypes.func.isRequired,
    onExcerptCreate: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    actionComponent: PropTypes.func,
};

const defaultProps = {
    pending: false,
    className: '',
    disabled: false,
    entry: undefined,
    tabularData: undefined,
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

    getWidgets = memoize((widgets, widgetType) => (
        widgets.filter(
            w => hasWidgetTagComponent(w.widgetId, widgetType, w.properties.addedFrom),
        )
    ))

    // Faram

    handleChange = (faramValues, faramErrors, faramInfo) => {
        const entryKey = entryAccessor.key(this.props.entry);
        const entryId = entryAccessor.serverId(this.props.entry);
        this.props.onChange(faramValues, faramErrors, faramInfo, entryKey, entryId);
    }

    handleExcerptChange = (excerptData) => {
        const entryKey = entryAccessor.key(this.props.entry);
        const entryId = entryAccessor.serverId(this.props.entry);
        this.props.onExcerptChange(excerptData, entryKey, entryId);
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
            widgetId,
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
                <h5
                    title={error || title}
                    className={styles.heading}
                >
                    { hasError && <Icon name="warning" /> }
                    { hasError ? `${title} : ${error}` : title }
                </h5>
                { ActionComponent && entry && isViewPage && (
                    <div className={styles.actionButtons}>
                        <ActionComponent
                            attributeKey={id}
                            attributeData={data}
                            entryKey={entryKey}
                            widgetId={widgetId}
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
            tabularData,
            onEntryStateChange,
            entryState,
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
            tabularField,
        } = entryAccessor.data(entry) || {};

        let widgetProps = {
            widgetName: widgetId,
            widgetType,
            widget,
        };

        // Level one widgets can view excerpt information
        const levelOneWidgets = [
            'excerptWidget',
            'geoWidget',
            'organigramWidget',
            'conditionalWidget',
        ];
        if (levelOneWidgets.includes(widgetId)) {
            const entryKey = entryAccessor.key(this.props.entry);

            widgetProps = {
                ...widgetProps,
                entryType,
                excerpt,
                image,
                tabularField,
                tabularFieldData: tabularData,
                entryState,
                onEntryStateChange,
                entryKey,
            };
        }

        // Level two widgets can edit excerpt information
        const levelTwoWidgets = ['excerptWidget'];
        if (levelTwoWidgets.includes(widgetId)) {
            widgetProps = {
                ...widgetProps,
                onExcerptChange: this.handleExcerptChange,
                onExcerptCreate: this.handleExcerptCreate,
            };
        }

        const Widget = fetchWidgetTagComponent(
            widgetId,
            widgetType,
            addedFrom,
        );

        // Widgets to allow drag and drop
        const dropableWidgets = widgetType === VIEW.overview ? [
            'excerptWidget',
            'matrix1dWidget',
            'matrix2dWidget',
        ] : [
            'excerptWidget',
        ];
        const isDroppable = dropableWidgets.includes(widgetId);

        return (
            <WidgetContentWrapper
                className={styles.content}
                blockDrop={!isDroppable}
            >
                <FaramGroup faramElementName={String(id)}>
                    <FaramGroup faramElementName="data">
                        <Widget
                            {...widgetProps}
                        />
                    </FaramGroup>
                </FaramGroup>
            </WidgetContentWrapper>
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
            disabled,
            widgetType,
            fieldId,
            bookId,
        } = this.props;

        const error = entryAccessor.error(entry);
        const className = `
            ${styles.widgetFaram}
            ${classNameFromProps}
            'widget-faram'
        `;

        const filteredWidgets = this.getWidgets(widgets, widgetType);

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
                disabled={pending || disabled}
            >
                { pending && <LoadingAnimation /> }
                <GridViewLayout
                    data={filteredWidgets}
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
