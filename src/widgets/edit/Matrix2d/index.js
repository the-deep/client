import PropTypes from 'prop-types';
import React from 'react';
import Faram, {
    FaramList,
    requiredCondition,
    FaramGroup,
} from '@togglecorp/faram';
import {
    getDuplicates,
    randomString,
    _cs,
} from '@togglecorp/fujs';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import ScrollTabs from '#rscv/ScrollTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';

import TabTitle from '#components/general/TabTitle';
import _ts from '#ts';

import Row from './Row';
import Column from './Column';
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
                    titleColumnWidth: [],
                    subTitleColumnWidth: [],
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

                                    // TODO: implement orientation and fontSize
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
                        faramValues={this.state.faramValues}
                        keySelector={Matrix2dEditWidget.keySelector}
                        onAddDimensionFaramAction={this.handleAddDimensionFaramAction}
                        onGeoLinkModalVisiblityChange={this.handleModalVisiblityChange}
                        onLinkWidgetModalVisiblityChange={this.handleModalVisiblityChange}
                        onDimensionContentBackButtonClick={
                            this.handleDimensionContentBackButtonClick
                        }
                        onDimensionEditButtonClick={this.handleDimensionEditButtonClick}
                        dimensionItemRendererParams={this.dimensionItemRendererParams}
                        selectedDimensionKey={this.state.selectedDimensionKey}
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
                        faramValues={this.state.faramValues}
                        keySelector={Matrix2dEditWidget.keySelector}
                        onAddSectorFaramAction={this.handleAddSectorFaramAction}
                        onGeoLinkModalVisiblityChange={this.handleModalVisiblityChange}
                        onLinkWidgetModalVisiblityChange={this.handleModalVisiblityChange}
                        onSectorContentBackButtonClick={
                            this.handleSectorContentBackButtonClick
                        }
                        onSectorEditButtonClick={this.handleSectorEditButtonClick}
                        sectorItemRendererParams={this.sectorItemRendererParams}
                        selectedSectorKey={this.state.selectedSectorKey}
                        titleSelector={Matrix2dEditWidget.titleSelector}
                        widgetKey={this.props.widgetKey}
                    />
                ),
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
        this.setState({ selectedDimensionKey: key });
    }

    handleSectorEditButtonClick = (key) => {
        this.setState({ selectedSectorKey: key });
    }

    render() {
        const {
            faramErrors,
            faramValues,
            hasError,
            pristine,
            selectedTab,
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
                    />
                    <FaramList faramElementName={selectedTab}>
                        <NonFieldErrors
                            className={styles.nonFieldErrors}
                            faramElement
                        />
                    </FaramList>
                    <TextInput
                        autoFocus
                        className={styles.titleInput}
                        faramElementName="title"
                        label={_ts('widgets.editor.matrix2d', 'titleLabel')}
                        placeholder={_ts('widgets.editor.matrix2d', 'widgetTitlePlaceholder')}
                        selectOnFocus
                        persistantHintAndError={false}
                    />
                    <div className={styles.metaInputs}>
                        <FaramGroup faramElementName="meta">
                            <TextInput
                                className={styles.titleRowHeightInput}
                                faramElementName="titleRowHeight"
                                label="Title row height"
                                type="number"
                                persistantHintAndError={false}
                            />
                            <TextInput
                                type="number"
                                label="Title column width"
                                className={styles.titleColumnWidthInput}
                                faramElementName="titleColumnWidth"
                                persistantHintAndError={false}
                            />
                            <TextInput
                                type="number"
                                label="Subtitle column width"
                                className={styles.subTitleColumnWidthInput}
                                faramElementName="subTitleColumnWidth"
                                persistantHintAndError={false}
                            />
                        </FaramGroup>
                    </div>
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
            </Faram>
        );
    }
}
