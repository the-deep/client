import PropTypes from 'prop-types';
import React from 'react';

import Faram, {
    FaramList,
    requiredCondition,
    FaramGroup,
} from '@togglecorp/faram';

import {
    getDuplicates,
    isNotDefined,
    randomString,
    _cs,
} from '@togglecorp/fujs';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import Checkbox from '#rsci/Checkbox';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import ScrollTabs from '#rscv/ScrollTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';

import TabTitle from '#components/general/TabTitle';
import OrientationInput from '#components/general/OrientationInput';

import _ts from '#ts';

import Row from './Row';
import Column from './Column';

import DimensionContent from './Row/DimensionContent';
import SectorContent from './Column/SectorContent';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgetKey: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    data: {},
};

const emptyArray = [];
const emptyObject = {};

export default class Matrix2dEditWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = elem => elem.id;
    static titleSelector = elem => elem.title;

    static schema = {
        fields: {
            title: [requiredCondition],
            meta: {
                fields: {
                    titleRowHeight: [],
                    titleRowFontSize: [],
                    titleRowOrientation: [],
                    titleColumnWidth: [],
                    titleColumnFontSize: [],
                    titleColumnOrientation: [],
                    subTitleColumnWidth: [],
                    subTitleColumnFontSize: [],
                    subTitleColumnOrientation: [],
                    advanceSettings: [],
                    subsectorExpansion: [],
                },
            },
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
                        orientation: [],
                        fontSize: [],
                        height: [],
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
                                    orientation: [],
                                    fontSize: [],
                                    height: [],
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
                        orientation: [],
                        fontSize: [],
                        width: [],
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
                                    orientation: [],
                                    fontSize: [],
                                    width: [],
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
        const {
            dimensions,
            sectors,
            meta,
        } = data;

        return {
            dimensions,
            sectors,
            meta,
        };
    };

    static getTitleFromFaramValues = data => data.title;

    constructor(props) {
        super(props);

        const {
            title,
            data: {
                meta = emptyObject,
                dimensions = emptyArray,
                sectors = emptyArray,
            },
        } = props;

        this.state = {
            faramValues: {
                title,
                meta,
                dimensions,
                sectors,
            },
            faramErrors: {},
            pristine: true,
            hasError: false,

            selectionType: undefined,
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
                // TODO: use renderer params
                component: () => (
                    <Row
                        className={styles.tabContent}
                        dataModifier={Matrix2dEditWidget.dimensionDataModifier}
                        keySelector={Matrix2dEditWidget.keySelector}
                        onAddDimensionFaramAction={this.handleAddDimensionFaramAction}
                        onGeoLinkModalVisiblityChange={this.handleModalVisiblityChange}
                        onLinkWidgetModalVisiblityChange={this.handleModalVisiblityChange}
                        onDimensionEditButtonClick={this.handleDimensionEditButtonClick}
                        dimensionItemRendererParams={this.dimensionItemRendererParams}
                        titleSelector={Matrix2dEditWidget.titleSelector}
                        widgetKey={this.props.widgetKey}
                    />
                ),
            },
            sectors: {
                // TODO: use renderer params
                component: () => (
                    <Column
                        className={styles.tabContent}
                        dataModifier={Matrix2dEditWidget.sectorDataModifier}
                        keySelector={Matrix2dEditWidget.keySelector}
                        onAddSectorFaramAction={this.handleAddSectorFaramAction}
                        onGeoLinkModalVisiblityChange={this.handleModalVisiblityChange}
                        onLinkWidgetModalVisiblityChange={this.handleModalVisiblityChange}
                        onSectorEditButtonClick={this.handleSectorEditButtonClick}
                        sectorItemRendererParams={this.sectorItemRendererParams}
                        titleSelector={Matrix2dEditWidget.titleSelector}
                        widgetKey={this.props.widgetKey}
                    />
                ),
            },
        };
    }

    handleDimensionContentBackButtonClick = () => {
        this.setState({
            selectionType: undefined,
            selectedDimensionKey: undefined,
        });
    }

    handleSectorContentBackButtonClick = () => {
        this.setState({
            selectionType: undefined,
            selectedSectorKey: undefined,
        });
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

    handleAddDimensionFaramAction = (options) => {
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

    handleAddSectorFaramAction = (options) => {
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

    handleDimensionEditButtonClick = (key) => {
        this.setState({
            selectionType: 'dimension',
            selectedDimensionKey: key,
        });
    }

    handleSectorEditButtonClick = (key) => {
        this.setState({
            selectionType: 'sector',
            selectedSectorKey: key,
        });
    }

    renderEditContent() {
        const {
            faramValues,
            selectionType,
            selectedDimensionKey,
            selectedSectorKey,
        } = this.state;

        const { widgetKey } = this.props;

        let selectedIndex;
        if (selectionType === 'dimension' && faramValues && faramValues.dimensions) {
            const { dimensions } = faramValues;
            selectedIndex = dimensions.findIndex(
                dimension => (Matrix2dEditWidget.keySelector(dimension) === selectedDimensionKey),
            );
        } else if (selectionType === 'sector' && faramValues && faramValues.sectors) {
            const { sectors } = faramValues;
            selectedIndex = sectors.findIndex(
                sector => (Matrix2dEditWidget.keySelector(sector) === selectedSectorKey),
            );
        }

        if (isNotDefined(selectedIndex) || selectedIndex === -1) {
            return null;
        }

        if (selectionType === 'dimension') {
            return (
                <FaramList
                    faramElementName="dimensions"
                    keySelector={Matrix2dEditWidget.keySelector}
                >
                    <DimensionContent
                        className={styles.editContent}
                        index={selectedIndex}
                        onBackButtonClick={this.handleDimensionContentBackButtonClick}
                        widgetKey={widgetKey}
                    />
                </FaramList>
            );
        } else if (selectionType === 'sector') {
            return (
                <FaramList
                    faramElementName="sectors"
                    keySelector={Matrix2dEditWidget.keySelector}
                >
                    <SectorContent
                        className={styles.editContent}
                        index={selectedIndex}
                        onBackButtonClick={this.handleSectorContentBackButtonClick}
                        widgetKey={widgetKey}
                    />
                </FaramList>
            );
        }

        return null;
    }

    render() {
        const {
            faramErrors,
            faramValues,
            hasError,
            pristine,
            selectedTab,
            selectionType,
        } = this.state;

        const {
            className,
            closeModal,
            title,
        } = this.props;


        return (
            <Faram
                className={_cs(className, styles.matrixTwoDEditWidget)}
                error={faramErrors}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                schema={Matrix2dEditWidget.schema}
                value={faramValues}
            >
                {isNotDefined(selectionType) ? (
                    <React.Fragment>
                        <div className={styles.header}>
                            <h2 className={styles.heading}>
                                {title}
                            </h2>
                            <div className={styles.actions}>
                                <DangerConfirmButton
                                    className={styles.button}
                                    confirmationMessage={_ts('widgets.editor.matrix2d', 'cancelConfirmMessage')}
                                    onClick={closeModal}
                                    skipConfirmation={pristine}
                                >
                                    {_ts('widgets.editor.matrix2d', 'cancelButtonLabel')}
                                </DangerConfirmButton>
                                <PrimaryButton
                                    className={styles.button}
                                    disabled={pristine || hasError}
                                    type="submit"
                                >
                                    {_ts('widgets.editor.matrix2d', 'saveButtonLabel')}
                                </PrimaryButton>
                            </div>
                        </div>
                        <div className={styles.content}>
                            <NonFieldErrors
                                className={styles.nonFieldErrors}
                                faramElement
                                persistent={false}
                            />
                            <FaramList faramElementName={selectedTab}>
                                <NonFieldErrors
                                    className={styles.nonFieldErrors}
                                    faramElement
                                    persistent={false}
                                />
                            </FaramList>
                            <TextInput
                                autoFocus
                                className={styles.titleInput}
                                faramElementName="title"
                                label={_ts('widgets.editor.matrix2d', 'titleLabel')}
                                placeholder={_ts('widgets.editor.matrix2d', 'widgetTitlePlaceholder')}
                                selectOnFocus
                                persistentHintAndError={false}
                            />
                            <div className={styles.metaInputs}>
                                <FaramGroup faramElementName="meta">
                                    <div className={styles.titleColumnInputs}>
                                        <h4 className={styles.heading}>
                                            {_ts('widgets.editor.matrix2d', 'titleColumnInputsHeading')}
                                        </h4>
                                        <div className={styles.content}>
                                            <TextInput
                                                type="number"
                                                label={_ts('widgets.editor.matrix2d', 'titleColumnWidthLabel')}
                                                className={styles.widthInput}
                                                faramElementName="titleColumnWidth"
                                                persistentHintAndError={false}
                                                placeholder={_ts('widgets.editor.matrix2d', 'widthInputPlaceholder')}
                                            />
                                            <TextInput
                                                type="number"
                                                label={_ts('widgets.editor.matrix2d', 'titleColumnFontSizeLabel')}
                                                className={styles.fontSizeInput}
                                                faramElementName="titleColumnFontSize"
                                                persistentHintAndError={false}
                                                placeholder={_ts('widgets.editor.matrix2d', 'fontSizeInputPlaceholder')}
                                            />
                                            <OrientationInput
                                                className={styles.orientationInput}
                                                faramElementName="titleColumnOrientation"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.subTitleColumnInputs}>
                                        <h4 className={styles.heading}>
                                            {_ts('widgets.editor.matrix2d', 'subTitleColumnInputsHeading')}
                                        </h4>
                                        <div className={styles.content}>
                                            <TextInput
                                                type="number"
                                                label={_ts('widgets.editor.matrix2d', 'subtitleColumnWidthLabel')}
                                                className={styles.widthInput}
                                                faramElementName="subTitleColumnWidth"
                                                placeholder={_ts('widgets.editor.matrix2d', 'widthInputPlaceholder')}
                                                persistentHintAndError={false}
                                            />
                                            <TextInput
                                                type="number"
                                                label={_ts('widgets.editor.matrix2d', 'subtitleColumnFontSizeLabel')}
                                                className={styles.fontSizeInput}
                                                faramElementName="subTitleColumnFontSize"
                                                placeholder={_ts('widgets.editor.matrix2d', 'fontSizeInputPlaceholder')}
                                                persistentHintAndError={false}
                                            />
                                            <OrientationInput
                                                className={styles.orientationInput}
                                                faramElementName="subTitleColumnOrientation"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.titleRowInputs}>
                                        <h4 className={styles.heading}>
                                            {_ts('widgets.editor.matrix2d', 'titleRowInputsHeading')}
                                        </h4>
                                        <div className={styles.content}>
                                            <TextInput
                                                className={styles.heightInput}
                                                faramElementName="titleRowHeight"
                                                label={_ts('widgets.editor.matrix2d', 'titleRowHeightLabel')}
                                                type="number"
                                                placeholder={_ts('widgets.editor.matrix2d', 'heightInputPlaceholder')}
                                                persistentHintAndError={false}
                                            />
                                            <TextInput
                                                className={styles.fontSizeInput}
                                                faramElementName="titleRowFontSize"
                                                label={_ts('widgets.editor.matrix2d', 'titleRowFontSizeLabel')}
                                                type="number"
                                                placeholder={_ts('widgets.editor.matrix2d', 'fontSizeInputPlaceholder')}
                                                persistentHintAndError={false}
                                            />
                                            <OrientationInput
                                                className={styles.orientationInput}
                                                faramElementName="titleRowOrientation"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.enableSettingInputs}>
                                        <h4 className={styles.heading}>
                                            {_ts('widgets.editor.matrix2d', 'generalSettings')}
                                        </h4>
                                        <div className={styles.content}>
                                            <Checkbox
                                                className={styles.checkboxInput}
                                                faramElementName="advanceSettings"
                                                label={_ts('widgets.editor.matrix2d', 'advanceSettingsLabel')}
                                                persistentHintAndError={false}
                                            />
                                            <Checkbox
                                                className={styles.checkboxInput}
                                                faramElementName="subsectorExpansion"
                                                label={_ts('widgets.editor.matrix2d', 'subsectorExpansionLabel')}
                                                persistentHintAndError={false}
                                            />
                                        </div>
                                    </div>
                                </FaramGroup>
                            </div>
                            <div className={styles.childrenInputs}>
                                <ScrollTabs
                                    active={selectedTab}
                                    className={styles.tabs}
                                    onClick={this.handleTabSelect}
                                    renderer={TabTitle}
                                    rendererParams={this.tabRendererParams}
                                    tabs={this.tabs}
                                />
                                <MultiViewContainer
                                    views={this.views}
                                    active={selectedTab}
                                />
                            </div>
                        </div>
                    </React.Fragment>
                ) : (
                    this.renderEditContent()
                )}
            </Faram>
        );
    }
}
