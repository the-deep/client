import PropTypes from 'prop-types';
import React from 'react';

import Faram from '#rs/components/Input/Faram';
import FaramGroup from '#rs/components/Input/Faram/FaramGroup';
import GridViewLayout from '#rs/components/View/GridViewLayout';
import LoadingAnimation from '#rscv/LoadingAnimation';

import { entryAccessor } from '#entities/editEntries';
import { iconNames } from '#constants';

import { fetchWidget } from '../widgets';

import ErrorWrapper from '../ErrorWrapper';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    schema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
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
        return (widgetType === 'list' ? listGridLayout : overviewGridLayout);
    }

    renderWidgetHeader = (widget) => {
        const { title, id } = widget;

        const {
            actionComponent: ActionComponent,
            entry,
        } = this.props;

        const {
            data: { attributes: { [id]: { data } = {} } = {} } = {},
        } = entry || {};
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
                { ActionComponent && entry && (
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
            id,
            widgetId,
        } = widget;
        const {
            widgetType,
            entry,
        } = this.props;
        const {
            entryType,
            excerpt,
            image,
        } = entryAccessor.data(entry) || {};

        const Widget = fetchWidget(widgetType, widgetId);

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
