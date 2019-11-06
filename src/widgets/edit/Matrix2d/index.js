import PropTypes from 'prop-types';
import React from 'react';
import Faram, { FaramList, requiredCondition } from '@togglecorp/faram';
import {
    getDuplicates,
    randomString,
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import SortableListView from '#rscv/SortableListView';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import AccentButton from '#rsca/Button/AccentButton';
import TextInput from '#rsci/TextInput';
import ScrollTabs from '#rscv/ScrollTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';

import TabTitle from '#components/general/TabTitle';
import _ts from '#ts';

import LinkWidgetModalButton from '#widgetComponents/LinkWidgetModal/Button';
import GeoLink from '#widgetComponents/GeoLink';

import SectorTitle from './SectorTitle';
import SectorContent from './SectorContent';
import DimensionTitle from './DimensionTitle';
import DimensionContent from './DimensionContent';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgetKey: PropTypes.string.isRequired,
};

const defaultProps = {
    data: {},
};

const emptyArray = [];

export default class Matrix2dEditWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = elem => elem.id;
    static titleSelector = elem => elem.title;

    static schema = {
        fields: {
            title: [requiredCondition],
            dimensions: {
                validation: (dimensions) => {
                    const errors = [];
                    if (!dimensions || dimensions.length <= 0) {
                        errors.push(_ts('widgets.editor.matrix2d', 'atLeastOneError'));
                    }

                    const duplicates = getDuplicates(dimensions, o => o.title);
                    if (duplicates.length > 0) {
                        errors.push(_ts(
                            'widgets.editor.matrix2d',
                            'duplicationError',
                            { duplicates: duplicates.join(', ') },
                        ));
                    }
                    return errors;
                },
                keySelector: Matrix2dEditWidget.keySelector,
                member: {
                    fields: {
                        id: [requiredCondition],
                        color: [],
                        title: [requiredCondition],
                        tooltip: [],
                        subdimensions: {
                            validation: (subdimensions) => {
                                const errors = [];
                                if (!subdimensions || subdimensions.length <= 0) {
                                    errors.push(_ts('widgets.editor.matrix2d', 'atLeastOneError'));
                                }

                                const duplicates = getDuplicates(subdimensions, o => o.title);
                                if (duplicates.length > 0) {
                                    errors.push(_ts(
                                        'widgets.editor.matrix2d',
                                        'duplicationError',
                                        { duplicates: duplicates.join(', ') },
                                    ));
                                }
                                return errors;
                            },
                            keySelector: Matrix2dEditWidget.keySelector,
                            member: {
                                fields: {
                                    id: [requiredCondition],
                                    tooltip: [],
                                    title: [requiredCondition],
                                },
                            },
                        },
                    },
                },
            },
            sectors: {
                validation: (sectors) => {
                    const errors = [];
                    if (!sectors || sectors.length <= 0) {
                        errors.push(_ts('widgets.editor.matrix2d', 'atLeastOneError'));
                    }

                    const duplicates = getDuplicates(sectors, o => o.title);
                    if (duplicates.length > 0) {
                        errors.push(_ts(
                            'widgets.editor.matrix2d',
                            'duplicationError',
                            { duplicates: duplicates.join(', ') },
                        ));
                    }
                    return errors;
                },
                keySelector: Matrix2dEditWidget.keySelector,
                member: {
                    fields: {
                        id: [requiredCondition],
                        title: [requiredCondition],
                        tooltip: [],
                        subsectors: {
                            validation: (subsectors) => {
                                const errors = [];
                                if (subsectors && subsectors.length > 0) {
                                    const duplicates = getDuplicates(subsectors, o => o.title);
                                    if (duplicates.length > 0) {
                                        errors.push(_ts(
                                            'widgets.editor.matrix2d',
                                            'duplicationError',
                                            { duplicates: duplicates.join(', ') },
                                        ));
                                    }
                                }
                                return errors;
                            },
                            keySelector: Matrix2dEditWidget.keySelector,
                            member: {
                                fields: {
                                    id: [requiredCondition],
                                    tooltip: [],
                                    title: [requiredCondition],
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    static dimensionDataModifier = row => row.map(r => ({
        id: randomString(16),
        title: r.label,
        originalWidget: r.originalWidget,
        originalKey: r.originalKey,
        color: undefined,
        tooltip: '',
        subdimensions: [],
    }));

    static sectorDataModifier = row => row.map(r => ({
        id: randomString(16),
        title: r.label,
        originalWidget: r.originalWidget,
        originalKey: r.originalKey,
        tooltip: '',
        subsectors: [],
    }));

    static getDataFromFaramValues = (data) => {
        const { dimensions, sectors } = data;
        return { dimensions, sectors };
    };

    static getTitleFromFaramValues = data => data.title;

    constructor(props) {
        super(props);

        const {
            title,
            data: {
                dimensions = emptyArray,
                sectors = emptyArray,
            },
        } = props;

        this.state = {
            faramValues: {
                title,
                dimensions,
                sectors,
            },
            faramErrors: {},
            pristine: true,
            hasError: false,

            selectedDimensionKey: undefined,
            selectedSectorKey: undefined,

            selectedTab: 'dimensions',
        };

        this.tabs = {
            dimensions: _ts('widgets.editor.matrix2d', 'dimensionsHeaderTitle'),
            sectors: _ts('widgets.editor.matrix2d', 'sectorsHeaderTitle'),
        };

        this.views = {
            dimensions: {
                component: () => {
                    const {
                        faramValues,
                        selectedDimensionKey,
                    } = this.state;

                    const {
                        dimensions: dimensionsFromState = [],
                    } = faramValues || {};

                    const selectedDimensionIndex = dimensionsFromState.findIndex(
                        dimension => (
                            Matrix2dEditWidget.keySelector(dimension) === selectedDimensionKey
                        ),
                    );

                    return (
                        <FaramList
                            faramElementName="dimensions"
                            keySelector={Matrix2dEditWidget.keySelector}
                        >
                            <div className={styles.panels}>
                                { (isDefined(selectedDimensionIndex)
                                    && selectedDimensionIndex !== -1) ? (
                                        <DimensionContent
                                            index={selectedDimensionIndex}
                                            onBackButtonClick={
                                                this.handleDimensionContentBackButtonClick
                                            }
                                            className={styles.rightPanel}
                                            widgetKey={this.props.widgetKey}
                                        />
                                    ) : (
                                        <SortableListView
                                            className={styles.leftPanel}
                                            faramElement
                                            rendererParams={this.dimensionItemRendererParams}
                                            itemClassName={styles.item}
                                            renderer={DimensionTitle}
                                            dragHandleClassName={styles.dragHandle}
                                        />
                                    )
                                }
                            </div>
                        </FaramList>
                    );
                },
                wrapContainer: true,
            },
            sectors: {
                component: () => {
                    const {
                        faramValues,
                        selectedSectorKey,
                    } = this.state;

                    const {
                        sectors: sectorsFromState = [],
                    } = faramValues || {};

                    const selectedSectorIndex = sectorsFromState.findIndex(
                        sector => (
                            Matrix2dEditWidget.keySelector(sector) === selectedSectorKey
                        ),
                    );

                    return (
                        <FaramList
                            faramElementName="sectors"
                            keySelector={Matrix2dEditWidget.keySelector}
                        >
                            <div className={styles.panels}>
                                { isDefined(selectedSectorKey) && selectedSectorIndex !== -1 ? (
                                    <SectorContent
                                        index={selectedSectorIndex}
                                        className={styles.rightPanel}
                                        onBackButtonClick={this.handleSectorContentBackButtonClick}
                                        widgetKey={this.props.widgetKey}
                                        onNestedModalChange={this.handleNestedModalChange}
                                    />
                                ) : (
                                    <SortableListView
                                        className={styles.leftPanel}
                                        faramElement
                                        rendererParams={this.sectorItemRendererParams}
                                        itemClassName={styles.item}
                                        renderer={SectorTitle}
                                        dragHandleClassName={styles.dragHandle}
                                    />
                                )}
                            </div>
                        </FaramList>
                    );
                },
                wrapContainer: true,
            },
        };
    }

    handleDimensionContentBackButtonClick = () => {
        this.setState({ selectedDimensionKey: undefined });
    }

    handleSectorContentBackButtonClick = () => {
        this.setState({ selectedSectorKey: undefined });
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        const {
            selectedTab,
            selectedDimensionKey,
            selectedSectorKey,
        } = this.state;

        const tabName = selectedTab === 'dimensions' ? 'selectedDimensionKey' : 'selectedSectorKey';

        const currentSelectedRowKey = selectedTab === 'dimensions' ? selectedDimensionKey : selectedSectorKey;
        const selectedRowKey = faramInfo.lastItem ? (
            Matrix2dEditWidget.keySelector(faramInfo.lastItem)
        ) : (
            currentSelectedRowKey
        );

        this.setState({
            faramValues,
            faramErrors,
            [tabName]: selectedRowKey,
            pristine: false,
            hasError: faramInfo.hasError,
        });

        const {
            widgetKey,
            onChange,
        } = this.props;
        onChange(
            widgetKey,
            Matrix2dEditWidget.getDataFromFaramValues(faramValues),
            Matrix2dEditWidget.getTitleFromFaramValues(faramValues),
        );
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            hasError: true,
        });
    };

    handleFaramValidationSuccess = (_, faramValues) => {
        const {
            onSave,
            closeModal,
            widgetKey,
        } = this.props;

        onSave(
            widgetKey,
            Matrix2dEditWidget.getDataFromFaramValues(faramValues),
            Matrix2dEditWidget.getTitleFromFaramValues(faramValues),
        );
        closeModal();
    };

    addDimensionClick = (options) => {
        const newDimension = {
            id: randomString(16),
            color: undefined,
            title: '',
            tooltip: '',
            subdimensions: [],
        };

        this.setState({
            selectedDimensionKey: Matrix2dEditWidget.keySelector(newDimension),
        });

        return [
            ...options,
            newDimension,
        ];
    }

    addSectorClick = (options) => {
        const newSector = {
            id: randomString(16),
            title: '',
            tooltip: '',
            sectors: [],
        };

        this.setState({
            selectedSectorKey: Matrix2dEditWidget.keySelector(newSector),
        });

        return [
            ...options,
            newSector,
        ];
    }

    tabRendererParams = (tabKey, data) => ({
        faramElementName: tabKey,
        title: data,
    });

    handleTabSelect = (selectedTab) => {
        this.setState({ selectedTab });
    }

    dimensionItemRendererParams = (key, elem, i) => ({
        className: styles.dimensionContent,
        index: i,
        faramElementName: String(i),
        data: elem,
        onEditButtonClick: () => {
            this.setState({ selectedDimensionKey: key });
        },
        keySelector: Matrix2dEditWidget.keySelector,
    })

    sectorItemRendererParams = (key, elem, i) => ({
        index: i,
        faramElementName: String(i),
        data: elem,
        onEditButtonClick: () => {
            this.setState({ selectedSectorKey: key });
        },
        isSelected: this.state.selectedSectorKey === key,
        keySelector: Matrix2dEditWidget.keySelector,
    })

    renderTabsWithButton = () => {
        const { selectedTab } = this.state;

        const dataModifier = selectedTab === 'dimensions'
            ? Matrix2dEditWidget.dimensionDataModifier
            : Matrix2dEditWidget.sectorDataModifier;

        return (
            <div className={styles.tabsContainer}>
                <FaramList faramElementName={selectedTab}>
                    <NonFieldErrors
                        faramElement
                        className={styles.error}
                    />
                </FaramList>
                <ScrollTabs
                    className={styles.tabs}
                    tabs={this.tabs}
                    active={selectedTab}
                    onClick={this.handleTabSelect}
                    renderer={TabTitle}
                    rendererParams={this.tabRendererParams}
                >
                    <div className={styles.buttonContainer}>
                        <h5>
                            {selectedTab === 'dimensions' ? (
                                _ts('widgets.editor.matrix2d', 'addDimensionsTitle')
                            ) : (
                                _ts('widgets.editor.matrix2d', 'addSectorsTitle')
                            )}
                        </h5>
                        <GeoLink
                            faramElementName={selectedTab}
                            titleSelector={Matrix2dEditWidget.titleSelector}
                            dataModifier={dataModifier}
                            onModalVisibilityChange={this.handleModalVisiblityChange}
                        />
                        <LinkWidgetModalButton
                            faramElementName={selectedTab}
                            widgetKey={this.props.widgetKey}
                            titleSelector={Matrix2dEditWidget.titleSelector}
                            dataModifier={dataModifier}
                            onModalVisibilityChange={this.handleModalVisiblityChange}
                        />
                        <FaramList faramElementName={selectedTab}>
                            {
                                selectedTab === 'dimensions' ? (
                                    <AccentButton
                                        faramElementName="add-dimension-btn"
                                        faramAction={this.addDimensionClick}
                                        iconName="add"
                                        transparent
                                    >
                                        {_ts('widgets.editor.matrix2d', 'addDimensionButtonTitle')}
                                    </AccentButton>
                                ) : (
                                    <AccentButton
                                        faramElementName="add-sector-btn"
                                        faramAction={this.addSectorClick}
                                        iconName="add"
                                        transparent
                                    >
                                        {_ts('widgets.editor.matrix2d', 'addSectorButtonTitle')}
                                    </AccentButton>
                                )
                            }
                        </FaramList>
                    </div>
                </ScrollTabs>
            </div>
        );
    }

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            hasError,
            selectedTab,
        } = this.state;

        const {
            closeModal,
            title,
            className,
        } = this.props;

        const TabsWithButton = this.renderTabsWithButton;

        return (
            <Faram
                className={_cs(className, styles.editContainer)}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                schema={Matrix2dEditWidget.schema}
                value={faramValues}
                error={faramErrors}
            >
                <div className={styles.header}>
                    <h2 className={styles.heading}>
                        {title}
                    </h2>
                    <DangerConfirmButton
                        className={styles.button}
                        onClick={closeModal}
                        confirmationMessage={_ts('widgets.editor.matrix2d', 'cancelConfirmMessage')}
                        skipConfirmation={pristine}
                    >
                        {_ts('widgets.editor.matrix2d', 'cancelButtonLabel')}
                    </DangerConfirmButton>
                    <PrimaryButton
                        className={styles.button}
                        type="submit"
                        disabled={pristine || hasError}
                    >
                        {_ts('widgets.editor.matrix2d', 'saveButtonLabel')}
                    </PrimaryButton>
                </div>
                <div className={styles.body}>
                    <NonFieldErrors
                        faramElement
                        className={styles.error}
                    />
                    <TextInput
                        className={styles.titleInput}
                        faramElementName="title"
                        autoFocus
                        label={_ts('widgets.editor.matrix2d', 'titleLabel')}
                        placeholder={_ts('widgets.editor.matrix2d', 'widgetTitlePlaceholder')}
                        selectOnFocus
                    />
                    <TabsWithButton />
                    <MultiViewContainer
                        views={this.views}
                        containerClassName={styles.modalUnitContainer}
                        active={selectedTab}
                    />
                </div>
            </Faram>
        );
    }
}
