import PropTypes from 'prop-types';
import React from 'react';
import Faram, { FaramList, requiredCondition } from '@togglecorp/faram';
import {
    getDuplicates,
    randomString,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import SortableListView from '#rscv/SortableListView';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import AccentButton from '#rsca/Button/AccentButton';
import TextInput from '#rsci/TextInput';
import ScrollTabs from '#rscv/ScrollTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';

import TabTitle from '#components/general/TabTitle';
import _ts from '#ts';
import _cs from '#cs';

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

            selectedDimensionKey: dimensions[0]
                ? Matrix2dEditWidget.keySelector(dimensions[0])
                : undefined,

            selectedSectorKey: sectors[0]
                ? Matrix2dEditWidget.keySelector(sectors[0])
                : undefined,

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
                                <SortableListView
                                    className={styles.leftPanel}
                                    dragHandleModifier={this.renderDragHandle}
                                    faramElement
                                    rendererParams={this.rendererParams}
                                    itemClassName={styles.item}
                                    renderer={DimensionTitle}
                                />
                                { dimensionsFromState.length > 0 && selectedDimensionIndex !== -1 &&
                                    <DimensionContent
                                        index={selectedDimensionIndex}
                                        className={styles.rightPanel}
                                        widgetKey={this.props.widgetKey}
                                    />
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
                                <SortableListView
                                    className={styles.leftPanel}
                                    dragHandleModifier={this.renderDragHandleSector}
                                    faramElement
                                    rendererParams={this.rendererParamsSector}
                                    itemClassName={styles.item}
                                    renderer={SectorTitle}
                                />
                                { sectorsFromState.length > 0 && selectedSectorIndex !== -1 &&
                                    <SectorContent
                                        index={selectedSectorIndex}
                                        className={styles.rightPanel}
                                        widgetKey={this.props.widgetKey}
                                        onNestedModalChange={this.handleNestedModalChange}
                                    />
                                }
                            </div>
                        </FaramList>
                    );
                },
                wrapContainer: true,
            },
        };
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

    rendererParams = (key, elem, i) => ({
        index: i,
        faramElementName: String(i),
        data: elem,
        setSelectedDimension: (k) => {
            this.setState({ selectedDimensionKey: k });
        },
        isSelected: this.state.selectedDimensionKey === key,
        keySelector: Matrix2dEditWidget.keySelector,
    })

    rendererParamsSector = (key, elem, i) => ({
        index: i,
        faramElementName: String(i),
        data: elem,
        setSelectedSector: (k) => {
            this.setState({ selectedSectorKey: k });
        },
        isSelected: this.state.selectedSectorKey === key,
        keySelector: Matrix2dEditWidget.keySelector,
    })

    renderDragHandle = (key) => {
        const { selectedDimensionKey } = this.state;
        const dragHandleClassName = _cs(
            styles.dragHandle,
            selectedDimensionKey === key && styles.active,
        );

        return (
            <Icon
                className={dragHandleClassName}
                name="hamburger"
            />
        );
    };

    renderDragHandleSector = (key) => {
        const { selectedSectorKey } = this.state;
        const dragHandleClassName = _cs(
            styles.dragHandle,
            selectedSectorKey === key && styles.active,
        );

        return (
            <Icon
                className={dragHandleClassName}
                name="hamburger"
            />
        );
    };

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
        } = this.props;

        const TabsWithButton = this.renderTabsWithButton;

        return (
            <Modal className={styles.editModal}>
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={Matrix2dEditWidget.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody className={styles.body}>
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
                    </ModalBody>
                    <ModalFooter>
                        <DangerConfirmButton
                            onClick={closeModal}
                            confirmationMessage={_ts('widgets.editor.matrix2d', 'cancelConfirmMessage')}
                            skipConfirmation={pristine}
                        >
                            {_ts('widgets.editor.matrix2d', 'cancelButtonLabel')}
                        </DangerConfirmButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine || hasError}
                        >
                            {_ts('widgets.editor.matrix2d', 'saveButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
