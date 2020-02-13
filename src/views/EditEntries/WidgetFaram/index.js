import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram, { FaramGroup } from '@togglecorp/faram';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import GridViewLayout from '#rscv/GridViewLayout';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    activeProjectRoleSelector,
    editEntriesAddEntryAction,
    editEntriesSetEntryDataAction,
    editEntriesSetExcerptAction,
    editEntriesSetEntryHighlightHidden,
    editEntriesResetExcerptAction,
} from '#redux';

import { entryAccessor } from '#entities/editEntries';

import {
    VIEW,
    hasWidgetTagComponent,
    fetchWidgetTagComponent,
} from '#widgets';

import {
    calculateEntryColor,
    calculateFirstTimeAttributes,
} from '../entryDataCalculator';

import WidgetContentWrapper from './WidgetContentWrapper';
import ErrorWrapper from './ErrorWrapper';
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

    // onExcerptReset: PropTypes.func.isRequired,
    // onHighlightHiddenChange: PropTypes.func.isRequired,

    actionComponent: PropTypes.func,

    addEntry: PropTypes.func.isRequired,
    setEntryData: PropTypes.func.isRequired,
    setExcerpt: PropTypes.func.isRequired,
    projectRole: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    setEntryHighlightHidden: PropTypes.func.isRequired,
    resetExcerpt: PropTypes.func.isRequired,

    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadId: PropTypes.number.isRequired,

    onEntryStateChange: PropTypes.func.isRequired,
    entryState: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    pending: false,
    className: '',
    disabled: false,
    entry: undefined,
    tabularData: undefined,
    widgets: [],
    schema: {},
    computeSchema: {},
    actionComponent: undefined,

    projectRole: {},
    analysisFramework: undefined,
    entryState: undefined,
};

const mapStateToProps = state => ({
    projectRole: activeProjectRoleSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addEntry: params => dispatch(editEntriesAddEntryAction(params)),
    setEntryData: params => dispatch(editEntriesSetEntryDataAction(params)),
    setExcerpt: params => dispatch(editEntriesSetExcerptAction(params)),
    setEntryHighlightHidden: params => dispatch(editEntriesSetEntryHighlightHidden(params)),
    resetExcerpt: params => dispatch(editEntriesResetExcerptAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class WidgetFaram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = widget => widget.key

    getWidgets = memoize((widgets, widgetType) => (
        widgets.filter(
            w => hasWidgetTagComponent(w.widgetId, widgetType, w.properties.addedFrom),
        )
    ))

    // Permission

    setExcerpt = (val) => {
        if (this.shouldDisableEntryChange(val.id)) {
            console.warn('No permission to edit entry excerpt');
            return;
        }
        const { setExcerpt } = this.props;
        setExcerpt(val);
    }

    setEntryData = (val) => {
        if (this.shouldDisableEntryChange(val.id)) {
            console.warn('No permission to edit entry');
            return;
        }
        const { setEntryData } = this.props;
        setEntryData(val);
    }

    setEntryHighlightHidden = (val) => {
        if (this.shouldDisableEntryChange(val.id)) {
            console.warn('No permission to change highlight visibility');
            return;
        }
        const { setEntryHighlightHidden } = this.props;
        setEntryHighlightHidden(val);
    }

    resetExcerpt = (val) => {
        if (this.shouldDisableEntryChange(val.id)) {
            console.warn('No permission to edit entry excerpt');
            return;
        }
        const { resetExcerpt } = this.props;
        resetExcerpt(val);
    }

    addEntry = (val) => {
        if (this.shouldDisableEntryCreate()) {
            console.warn('No permission to create entry');
            return;
        }
        const { addEntry } = this.props;
        addEntry(val);
    }

    shouldDisableEntryChange = (entryId) => {
        const { projectRole: { entryPermissions = {} } } = this.props;
        return !entryPermissions.modify && !!entryId;
    }

    shouldDisableEntryCreate = () => {
        const { projectRole: { entryPermissions = {} } } = this.props;
        return !entryPermissions.create;
    }

    // can edit/create entry
    // create when 'newEntry' is on info or entryKey is undefined
    handleChange = (faramValues, faramErrors, faramInfo) => {
        const {
            analysisFramework,
            lead,
            leadId,
            entry,
        } = this.props;

        const entryKey = entryAccessor.key(entry);
        const entryId = entryAccessor.serverId(entry);

        if (faramInfo.action === 'newEntry') {
            // TODO: if excerpt already exists modify existing entry
            // instead of creating a new one

            const {
                excerptType,
                excerptValue,
                value,
                faramElementName,
                dropped,
            } = faramInfo;

            // Create attribute using faramElementName and value
            let attributes = value;
            [...faramElementName].reverse().forEach((key) => {
                attributes = { [key]: attributes };
            });

            attributes = calculateFirstTimeAttributes(
                attributes,
                analysisFramework,
                lead,
            );
            const color = calculateEntryColor(attributes, analysisFramework);

            this.addEntry({
                leadId,
                entry: {
                    excerptType,
                    excerptValue,
                    lead: leadId,
                    attributes,
                    color,
                    analysisFramework: analysisFramework.id,
                },
                dropped,
            });
        } else if (entryKey === undefined && faramInfo.isComputed) {
            console.warn('Ignoring entry change if there is no entry key and the change is from entry creation.');
            // pass
        } else if (entryKey === undefined) {
            const excerptValue = '';
            const excerptType = 'excerpt';

            const attributes = calculateFirstTimeAttributes(
                faramValues,
                analysisFramework,
                lead,
            );
            const color = calculateEntryColor(attributes, analysisFramework);

            this.addEntry({
                leadId,
                entry: {
                    excerptType,
                    excerptValue,
                    lead: leadId,
                    attributes,
                    color,
                    analysisFramework: analysisFramework.id,
                },
                dropped: false,
            });
        } else {
            const color = calculateEntryColor(faramValues, analysisFramework);
            this.setEntryData({
                leadId,
                key: entryKey,
                id: entryId,
                values: faramValues,
                errors: faramErrors,
                info: faramInfo,
                color,
            });
        }
    }

    // can only edit entry
    handleHighlightHiddenChange = (value) => {
        const {
            entry,
            leadId,
        } = this.props;

        const entryKey = entryAccessor.key(entry);
        const entryId = entryAccessor.serverId(entry);

        this.setEntryHighlightHidden({
            leadId,
            key: entryKey,
            id: entryId,
            value,
        });
    }

    handleExcerptReset = () => {
        const {
            entry,
            leadId,
        } = this.props;

        const entryKey = entryAccessor.key(entry);
        const entryId = entryAccessor.serverId(entry);

        this.resetExcerpt({
            leadId,
            key: entryKey,
            id: entryId,
        });
    }

    handleExcerptChange = (excerptData) => {
        const {
            leadId,
            entry,
        } = this.props;

        const entryKey = entryAccessor.key(entry);
        const entryId = entryAccessor.serverId(entry);

        const { type, value, dropped } = excerptData;

        if (!entryKey) {
            console.warn('There is no entry key while changing excerpt.');
            // this.handleExcerptCreate({ type, value });
        } else {
            this.setExcerpt({
                leadId,
                key: entryKey,
                id: entryId,
                excerptType: type,
                excerptValue: value,
                dropped,
            });
        }
    }

    // can only create entry
    handleExcerptCreate = (excerptData) => {
        const {
            leadId,
            analysisFramework,
            lead,
        } = this.props;

        const { type, value, dropped } = excerptData;

        this.addEntry({
            leadId,
            entry: {
                analysisFramework: analysisFramework.id,
                excerptType: type,
                excerptValue: value,
                attributes: calculateFirstTimeAttributes(
                    {},
                    analysisFramework,
                    lead,
                ),
            },
            dropped,
        });
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
        const isExcerptWidget = widgetId === 'excerptWidget';

        const Header = ({ hasError, error }) => (
            <div
                className={_cs(
                    styles.header,
                    hasError ? styles.error : '',
                    isExcerptWidget && styles.excerptWidgetHeader,
                )}
                title={error}
            >
                <h5
                    title={error || title}
                    className={_cs(
                        styles.heading,
                        isExcerptWidget && styles.excerptWidgetHeading,
                    )}
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
            droppedExcerpt,
            image,
            tabularField,
        } = entryAccessor.data(entry) || {};

        const highlightHidden = entryAccessor.isHighlightHidden(entry);

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
                droppedExcerpt,
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
                highlightHidden,
                onHighlightHiddenChange: this.handleHighlightHiddenChange,
                onExcerptChange: this.handleExcerptChange,
                onExcerptCreate: this.handleExcerptCreate,
                onExcerptReset: this.handleExcerptReset,
            };
        }

        const Widget = fetchWidgetTagComponent(
            widgetId,
            widgetType,
            addedFrom,
        );

        // Widgets to allow drag and drop
        const droppableWidgets = widgetType === VIEW.overview ? [
            'excerptWidget',
            'matrix1dWidget',
            'matrix2dWidget',
            'textWidget',
        ] : [
            'excerptWidget',
        ];
        const isDroppable = droppableWidgets.includes(widgetId);

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
        } = this.props;

        const error = entryAccessor.error(entry);

        const className = _cs(
            styles.widgetFaram,
            classNameFromProps,
            'widget-faram',
        );

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
