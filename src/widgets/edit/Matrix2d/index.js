import PropTypes from 'prop-types';
import React from 'react';

import FaramList from '#rsci/Faram/FaramList';
import SortableListView from '#rscv/SortableListView';
import DangerButton from '#rsca/Button/DangerButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import Faram, { requiredCondition } from '#rsci/Faram';
import FixedTabs from '#rscv/FixedTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';
import { findDuplicates, randomString } from '#rsu/common';

import TabTitle from '#components/TabTitle';
import { iconNames } from '#constants';
import _ts from '#ts';

import SectorTitle from './SectorTitle';
import SectorContent from './SectorContent';
import DimensionTitle from './DimensionTitle';
import DimensionContent from './DimensionContent';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
};

const emptyArray = [];

export default class Matrix1dEditWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            title: [requiredCondition],
            dimensions: {
                validation: (dimensions) => {
                    const errors = [];
                    if (!dimensions || dimensions.length <= 0) {
                        // FIXME: use strings
                        errors.push('There should be at least one dimension.');
                    }

                    const duplicates = findDuplicates(dimensions, o => o.title);
                    if (duplicates.length > 0) {
                        // FIXME: use strings
                        errors.push(`Duplicate dimensions are not allowed: ${duplicates.join(', ')}`);
                    }
                    return errors;
                },
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
                                    // FIXME: use strings
                                    errors.push('There should be at least one subdimension.');
                                }

                                const duplicates = findDuplicates(subdimensions, o => o.title);
                                if (duplicates.length > 0) {
                                    // FIXME: use strings
                                    errors.push(`Duplicate subdimensions are not allowed: ${duplicates.join(', ')}`);
                                }
                                return errors;
                            },
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
                        // FIXME: use strings
                        errors.push('There should be at least one sector.');
                    }

                    const duplicates = findDuplicates(sectors, o => o.title);
                    if (duplicates.length > 0) {
                        // FIXME: use strings
                        errors.push(`Duplicate sectors are not allowed: ${duplicates.join(', ')}`);
                    }
                    return errors;
                },
                member: {
                    fields: {
                        id: [requiredCondition],
                        title: [requiredCondition],
                        tooltip: [],
                        subsectors: {
                            validation: (subsectors) => {
                                const errors = [];
                                if (subsectors && subsectors.length > 0) {
                                    const duplicates = findDuplicates(subsectors, o => o.title);
                                    if (duplicates.length > 0) {
                                        // FIXME: use strings
                                        errors.push(`Duplicate subsectors are not allowed: ${duplicates.join(', ')}`);
                                    }
                                }
                                return errors;
                            },
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

    static keyExtractor = elem => elem.id;

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
            pristine: false,

            selectedDimensionKey: dimensions[0]
                ? Matrix1dEditWidget.keyExtractor(dimensions[0])
                : undefined,

            selectedSectorKey: sectors[0]
                ? Matrix1dEditWidget.keyExtractor(sectors[0])
                : undefined,

            selectedTab: 'dimensions',
        };

        this.tabs = {
            dimensions: 'Dimensions',
            sectors: 'Sectors',
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
                            Matrix1dEditWidget.keyExtractor(dimension) === selectedDimensionKey
                        ),
                    );

                    return (
                        <FaramList faramElementName="dimensions">
                            <div className={styles.panels}>
                                <SortableListView
                                    className={styles.leftPanel}
                                    dragHandleModifier={this.renderDragHandle}
                                    faramElement
                                    keyExtractor={Matrix1dEditWidget.keyExtractor}
                                    rendererParams={this.rendererParams}
                                    itemClassName={styles.item}
                                    renderer={DimensionTitle}
                                />
                                { dimensionsFromState.length > 0 && selectedDimensionIndex !== -1 &&
                                    <DimensionContent
                                        index={selectedDimensionIndex}
                                        className={styles.rightPanel}
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
                            Matrix1dEditWidget.keyExtractor(sector) === selectedSectorKey
                        ),
                    );

                    return (
                        <FaramList faramElementName="sectors">
                            <div className={styles.panels}>
                                <SortableListView
                                    className={styles.leftPanel}
                                    dragHandleModifier={this.renderDragHandleSector}
                                    faramElement
                                    keyExtractor={Matrix1dEditWidget.keyExtractor}
                                    rendererParams={this.rendererParamsSector}
                                    itemClassName={styles.item}
                                    renderer={SectorTitle}
                                />
                                { sectorsFromState.length > 0 && selectedSectorIndex !== -1 &&
                                    <SectorContent
                                        index={selectedSectorIndex}
                                        className={styles.rightPanel}
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

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationSuccess = (faramValues) => {
        const {
            title,
            dimensions,
            sectors,
        } = faramValues;
        this.props.onSave(
            { dimensions, sectors },
            title,
        );
    };

    faramInfoForAdd = {
        newElement: () => ({
            id: randomString(16).toLowerCase(),
            color: undefined,
            title: '',
            tooltip: '',
            subdimensions: [],
        }),
        callback: (value) => {
            this.setState({
                selectedDimensionKey: Matrix1dEditWidget.keyExtractor(value),
            });
        },
    }

    faramInfoForAddSector = {
        newElement: () => ({
            id: randomString(16).toLowerCase(),
            title: '',
            tooltip: '',
            sectors: [],
        }),
        callback: (value) => {
            this.setState({
                selectedSectorKey: Matrix1dEditWidget.keyExtractor(value),
            });
        },
    }

    handleTabSelect = (selectedTab) => {
        this.setState({ selectedTab });
    }

    renderTabsWithButton = () => {
        const { selectedTab } = this.state;

        const buttonLabel = selectedTab === 'dimensions' ? (
            'Add dimension'
        ) : (
            'Add sector'
        );

        const faramInfo = selectedTab === 'dimensions'
            ? this.faramInfoForAdd
            : this.faramInfoForAddSector;

        return (
            <div className={styles.tabsContainer}>
                <FaramList faramElementName={selectedTab}>
                    <NonFieldErrors
                        faramElement
                        className={styles.error}
                    />
                </FaramList>
                <FixedTabs
                    className={styles.tabs}
                    tabs={this.tabs}
                    active={selectedTab}
                    onClick={this.handleTabSelect}
                    modifier={this.renderTab}
                >
                    <FaramList faramElementName={selectedTab}>
                        <PrimaryButton
                            faramAction="add"
                            faramInfo={faramInfo}
                            iconName={iconNames.add}
                            title={buttonLabel}
                            transparent
                        >
                            {buttonLabel}
                        </PrimaryButton>
                    </FaramList>
                </FixedTabs>
            </div>
        );
    }

    renderTab = (tabKey) => {
        const title = this.tabs[tabKey];

        return (
            <TabTitle
                title={title}
                faramElementName={tabKey}
            />
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
        keyExtractor: Matrix1dEditWidget.keyExtractor,
    })

    rendererParamsSector = (key, elem, i) => ({
        index: i,
        faramElementName: String(i),
        data: elem,
        setSelectedSector: (k) => {
            this.setState({ selectedSectorKey: k });
        },
        isSelected: this.state.selectedSectorKey === key,
        keyExtractor: Matrix1dEditWidget.keyExtractor,
    })

    renderDragHandle = (key) => {
        const dragHandleClassNames = [styles.dragHandle];
        const { selectedDimensionKey } = this.state;
        if (selectedDimensionKey === key) {
            dragHandleClassNames.push(styles.active);
        }

        return (
            <span className={`${iconNames.hamburger} ${dragHandleClassNames.join(' ')}`} />
        );
    };

    renderDragHandleSector = (key) => {
        const dragHandleClassNames = [styles.dragHandle];
        const { selectedSectorKey } = this.state;
        if (selectedSectorKey === key) {
            dragHandleClassNames.push(styles.active);
        }

        return (
            <span className={`${iconNames.hamburger} ${dragHandleClassNames.join(' ')}`} />
        );
    };

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            selectedTab,
        } = this.state;
        const {
            onClose,
            title,
        } = this.props;


        // FIXME: Use strings
        const cancelButtonLabel = 'Cancel';
        const saveButtonLabel = 'Save';

        const TabsWithButton = this.renderTabsWithButton;

        return (
            <Modal className={styles.editModal}>
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={Matrix1dEditWidget.schema}
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
                            label={_ts('framework.excerptWidget', 'titleLabel')}
                            placeholder={_ts('framework.excerptWidget', 'widgetTitlePlaceholder')}
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
                        <DangerButton onClick={onClose}>
                            {cancelButtonLabel}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            {saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
