import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Faram, { FaramGroup } from '@togglecorp/faram';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Button from '#rsca/Button';
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
    levelOneWidgets,
    levelTwoWidgets,
    droppableOverviewWidgets,
    droppableListWidgets,
} from '#utils/widget';

import WidgetErrorWrapper from '#components/general/WidgetErrorWrapper';
import WidgetContentWrapper from '#components/general/WidgetContentWrapper';
import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import {
    calculateEntryColor,
    calculateFirstTimeAttributes,
} from '../entryDataCalculator';

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

const getWidgets = memoize((widgets, widgetType) => (
    widgets.filter(
        w => hasWidgetTagComponent(w.widgetId, widgetType, w.properties.addedFrom),
    )
));

const keySelector = d => d.key;

function WidgetFaram(props) {
    const {
        entry = {},
        widgets,
        className: classNameFromProps,
        schema,
        computeSchema,
        pending,
        disabled,
        widgetType,
        analysisFramework,
        lead,
        leadId,
        actionComponent: ActionComponent,
        projectRole: { entryPermissions = {} },
        entryState,
        onEntryStateChange,
        tabularData,

        setExcerpt: setExcerptFromProps,
        setEntryData: setEntryDataFromProps,
        setEntryHighlightHidden: setEntryHighlightHiddenFromProps,
        resetExcerpt: resetExcerptFromProps,
        addEntry: addEntryFromProps,
    } = props;

    const [
        isExcerptFrozen,
        freezeExcerpt,
        unFreezeExcerpt,
    ] = useModalState(false);

    const error = entryAccessor.error(entry);

    const filteredWidgets = useMemo(() => (
        getWidgets(widgets, widgetType)
    ), [widgets, widgetType]);

    const {
        data: { attributes } = {},
    } = entry;

    const shouldDisableEntryChange = useCallback(entryId => (
        !entryPermissions.modify && !!entryId
    ), [entryPermissions]);

    const shouldDisableEntryCreate = useMemo(() => (
        !entryPermissions.create
    ), [entryPermissions]);

    const setExcerpt = useCallback((val) => {
        if (shouldDisableEntryChange(val.id)) {
            console.warn('No permission to edit entry excerpt');
            return;
        }
        setExcerptFromProps(val);
    }, [setExcerptFromProps, shouldDisableEntryChange]);

    const setEntryData = useCallback((val) => {
        if (shouldDisableEntryChange(val.id)) {
            console.warn('No permission to edit entry');
            return;
        }
        setEntryDataFromProps(val);
    }, [setEntryDataFromProps, shouldDisableEntryChange]);

    const setEntryHighlightHidden = useCallback((val) => {
        if (shouldDisableEntryChange(val.id)) {
            console.warn('No permission to change highlight visibility');
            return;
        }
        setEntryHighlightHiddenFromProps(val);
    }, [setEntryHighlightHiddenFromProps, shouldDisableEntryChange]);

    const resetExcerpt = useCallback((val) => {
        if (shouldDisableEntryChange(val.id)) {
            console.warn('No permission to edit entry excerpt');
            return;
        }
        resetExcerptFromProps(val);
    }, [resetExcerptFromProps, shouldDisableEntryChange]);

    const addEntry = useCallback((val) => {
        if (shouldDisableEntryCreate) {
            console.warn('No permission to create entry');
            return;
        }
        addEntryFromProps(val);
    }, [addEntryFromProps, shouldDisableEntryCreate]);

    const handleHighlightHiddenChange = useCallback((value) => {
        const entryKey = entryAccessor.key(entry);
        const entryId = entryAccessor.serverId(entry);

        setEntryHighlightHidden({
            leadId,
            key: entryKey,
            id: entryId,
            value,
        });
    }, [setEntryHighlightHidden, entry, leadId]);

    const handleExcerptReset = useCallback(() => {
        const entryKey = entryAccessor.key(entry);
        const entryId = entryAccessor.serverId(entry);

        resetExcerpt({
            leadId,
            key: entryKey,
            id: entryId,
        });
    }, [resetExcerpt, entry, leadId]);

    // can only create entry
    const handleExcerptCreate = useCallback((excerptData) => {
        const { type, value, dropped } = excerptData;

        addEntry({
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
    }, [
        addEntry,
        analysisFramework,
        lead,
        leadId,
    ]);

    const handleExcerptChange = useCallback((excerptData) => {
        const entryKey = entryAccessor.key(entry);
        const entryId = entryAccessor.serverId(entry);

        const { type, value, dropped } = excerptData;

        if (!entryKey) {
            console.warn('There is no entry key while changing excerpt.');
            // this.handleExcerptCreate({ type, value });
        } else {
            setExcerpt({
                leadId,
                key: entryKey,
                id: entryId,
                excerptType: type,
                excerptValue: value,
                dropped,
            });
        }
    }, [entry, leadId, setExcerpt]);

    // can edit/create entry
    // create when 'newEntry' is on info or entryKey is undefined
    const handleChange = useCallback((faramValues, faramErrors, faramInfo) => {
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
            let newAttributes = value;
            [...faramElementName].reverse().forEach((key) => {
                newAttributes = { [key]: newAttributes };
            });

            newAttributes = calculateFirstTimeAttributes(
                newAttributes,
                analysisFramework,
                lead,
            );
            const color = calculateEntryColor(newAttributes, analysisFramework);

            addEntry({
                leadId,
                entry: {
                    excerptType,
                    excerptValue,
                    lead: leadId,
                    attributes: newAttributes,
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

            const newAttributes = calculateFirstTimeAttributes(
                faramValues,
                analysisFramework,
                lead,
            );
            const color = calculateEntryColor(newAttributes, analysisFramework);

            addEntry({
                leadId,
                entry: {
                    excerptType,
                    excerptValue,
                    lead: leadId,
                    attributes: newAttributes,
                    color,
                    analysisFramework: analysisFramework.id,
                },
                dropped: false,
            });
        } else {
            const color = calculateEntryColor(faramValues, analysisFramework);
            setEntryData({
                leadId,
                key: entryKey,
                id: entryId,
                values: faramValues,
                errors: faramErrors,
                info: faramInfo,
                color,
            });
        }
    }, [
        setEntryData,
        addEntry,
        analysisFramework,
        entry,
        lead,
        leadId,
    ]);

    const layoutSelector = useCallback((widget = {}) => {
        const {
            properties: {
                listGridLayout,
                overviewGridLayout,
            } = {},
        } = widget;
        return (widgetType === VIEW.list ? listGridLayout : overviewGridLayout);
    }, [widgetType]);

    const renderWidgetHeader = useCallback((widget) => {
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

        const Header = ({
            hasError: hasErrorForHeader,
            error: errorForHeader,
        }) => (
            <div
                className={_cs(
                    styles.header,
                    hasErrorForHeader ? styles.error : '',
                    isExcerptWidget && styles.excerptWidgetHeader,
                )}
                title={errorForHeader}
            >
                <h5
                    title={errorForHeader || title}
                    className={_cs(
                        styles.heading,
                        isExcerptWidget && styles.excerptWidgetHeading,
                    )}
                >
                    { hasErrorForHeader && <Icon name="warning" /> }
                    { hasErrorForHeader ? `${title} : ${errorForHeader}` : title }
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
                {isExcerptWidget && !isViewPage && (
                    <Button
                        className={styles.pinButton}
                        onClick={isExcerptFrozen ? unFreezeExcerpt : freezeExcerpt}
                        title={isExcerptFrozen ? _ts('editEntry', 'unPinExcerpt') : _ts('editEntry', 'pinExcerpt')}
                        iconName="pin"
                        transparent
                    />
                )}
            </div>
        );

        return (
            <FaramGroup faramElementName={String(id)}>
                <WidgetErrorWrapper
                    faramElementName="data"
                    renderer={Header}
                />
            </FaramGroup>
        );
    }, [
        isExcerptFrozen,
        freezeExcerpt,
        unFreezeExcerpt,
        widgetType,
        ActionComponent,
        entry,
    ]);

    const renderWidgetContent = useCallback((widget) => {
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
            tabularField: tabularFieldFromEntry,
        } = entryAccessor.data(entry) || {};

        const highlightHidden = entryAccessor.isHighlightHidden(entry);

        let widgetProps = {
            widgetName: widgetId,
            widgetType,
            widget,
        };

        if (levelOneWidgets.includes(widgetId)) {
            const entryKey = entryAccessor.key(entry);

            widgetProps = {
                ...widgetProps,
                entryType,
                excerpt,
                droppedExcerpt,
                image,
                tabularField: tabularFieldFromEntry,
                tabularFieldData: tabularData,
                entryState,
                onEntryStateChange,
                entryKey,
            };
        }

        if (levelTwoWidgets.includes(widgetId)) {
            widgetProps = {
                ...widgetProps,
                highlightHidden,
                onHighlightHiddenChange: handleHighlightHiddenChange,
                onExcerptChange: handleExcerptChange,
                onExcerptCreate: handleExcerptCreate,
                onExcerptReset: handleExcerptReset,
            };
        }

        const Widget = fetchWidgetTagComponent(
            widgetId,
            widgetType,
            addedFrom,
        );

        // Widgets to allow drag and drop
        const droppableWidgets = widgetType === VIEW.overview ?
            droppableOverviewWidgets : droppableListWidgets;
        const isDroppable = !!droppableWidgets[widgetId];

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
    }, [
        onEntryStateChange,
        handleExcerptChange,
        entryState,
        handleHighlightHiddenChange,
        handleExcerptReset,
        handleExcerptCreate,
        tabularData,
        entry,
        widgetType,
    ]);

    const itemRendererParams = useCallback((key, widget) => {
        const {
            widgetId,
        } = widget;
        const isExcerptWidget = widgetId === 'excerptWidget';

        return ({
            className: (isExcerptWidget && isExcerptFrozen) ? styles.frozenEntry : '',
        });
    }, [
        isExcerptFrozen,
    ]);

    return (
        <Faram
            className={_cs(
                styles.widgetFaram,
                classNameFromProps,
                'widget-faram',
            )}
            onChange={handleChange}
            schema={schema}
            computeSchema={computeSchema}
            value={attributes}
            error={error}
            disabled={pending || disabled}
        >
            { pending && <LoadingAnimation /> }
            <GridViewLayout
                data={filteredWidgets}
                layoutSelector={layoutSelector}
                itemRendererParams={itemRendererParams}
                itemHeaderModifier={renderWidgetHeader}
                itemContentModifier={renderWidgetContent}
                keySelector={keySelector}
                itemClassName={styles.widget}
            />
        </Faram>
    );
}

WidgetFaram.propTypes = propTypes;
WidgetFaram.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(WidgetFaram);
