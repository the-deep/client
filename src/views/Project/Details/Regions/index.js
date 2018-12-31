import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { caseInsensitiveSubmatch, compareString } from '#rsu/common';
import AccentButton from '#rsca/Button/AccentButton';
import SearchInput from '#rsci/SearchInput';
import RadioInput from '#rsci/RadioInput';
import ListView from '#rscv/List/ListView';
import ListItem from '#rscv/List/ListItem';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';

import {
    projectDetailsSelector,

    setProjectOptionsAction,
} from '#redux';
import { iconNames } from '#constants';
import _ts from '#ts';
import _cs from '#cs';
import AddRegion from '#components/AddRegion';

import AddExistingRegion from './AddExistingRegion';
import ProjectRegionDetail from './ProjectRegionDetail';
import ProjectOptionsGet from '../../requests/ProjectOptionsGet';
import styles from './styles.scss';

const propTypes = {
    projectId: PropTypes.number.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectOptions: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    readOnly: false,
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setProjectOptions: params => dispatch(setProjectOptionsAction(params)),
});

const emptyList = [];
const emptyObject = {};

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectRegions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const { projectDetails } = props;
        let selectedRegion = 0;
        if (projectDetails.regions && projectDetails.regions.length > 0) {
            selectedRegion = projectDetails.regions[0].id;
        }

        this.addRegionOptions = [
            {
                key: 'old',
                label: _ts('project', 'useExistingRegionText'),
            },
            {
                key: 'new',
                label: _ts('project', 'createNewRegionText'),
            },
        ];

        this.state = {
            displayRegionList: projectDetails.regions || emptyList,
            selectedRegion,
            pendingProjectOptions: true,
            selectedAddRegionOption: 'old',
            searchInputValue: '',
            showAddRegionModal: false,
        };

        this.projectOptionsGet = new ProjectOptionsGet({
            setState: params => this.setState(params),
            setProjectOptions: this.props.setProjectOptions,
        });
    }

    componentWillMount() {
        const { projectId } = this.props;

        this.projectOptionsGet.init(projectId);
        this.projectOptionsGet.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            projectDetails,
            projectId: newProjectId,
        } = nextProps;
        const { projectId: oldProjectId } = this.props;

        const {
            searchInputValue,
            selectedRegion,
        } = this.state;

        if (this.props.projectDetails !== projectDetails) {
            const { regions = [] } = projectDetails;
            const displayRegionList = regions.filter(
                region => caseInsensitiveSubmatch(region.title, searchInputValue),
            );

            let newSelectedRegion = selectedRegion;
            if (regions.findIndex(r => r.id === selectedRegion) === -1) {
                newSelectedRegion = regions.length > 0 ? regions[0].id : selectedRegion;
            }
            this.setState({
                displayRegionList,
                selectedRegion: newSelectedRegion,
            });
        }

        if (newProjectId !== oldProjectId) {
            this.projectOptionsGet.init(newProjectId);
            this.projectOptionsGet.start();
        }
    }

    componentWillUnmount() {
        this.projectOptionsGet.stop();
    }

    getModalClassName = () => {
        const { selectedAddRegionOption } = this.state;

        return _cs(
            styles.addRegionModal,
            selectedAddRegionOption === 'old' && styles.existingRegion,
        );
    }


    handleRegionClick = (regionId) => {
        this.setState({ selectedRegion: regionId });
    }

    handleSearchInputChange = (searchInputValue) => {
        const { projectDetails } = this.props;
        const { regions = [] } = projectDetails;
        const displayRegionList = regions.filter(
            region => caseInsensitiveSubmatch(region.title, searchInputValue),
        );

        this.setState({
            displayRegionList,
            searchInputValue,
        });
    };

    handleRadioInputChange = (selectedOption) => {
        this.setState({
            selectedAddRegionOption: selectedOption,
        });
    }

    handleAddRegionButtonClick = () => {
        this.setState({
            showAddRegionModal: true,
        });
    }

    handleModalClose = () => {
        this.setState({
            showAddRegionModal: false,
            selectedAddRegionOption: 'old',
        });
    };

    handleRegionClone = (selectedRegion) => {
        this.setState({ selectedRegion });
    }

    handleAddedRegions = (regions) => {
        if (regions) {
            this.setState({ selectedRegion: regions[0] });
        }
    }

    handleAddedRegion = (region) => {
        this.setState({ selectedRegion: region });
    }

    renderRegionListItem = (key, region) => {
        const { selectedRegion } = this.state;
        const isActive = region.id === selectedRegion;

        return (
            <ListItem
                active={isActive}
                key={region.id}
                onClick={() => { this.handleRegionClick(region.id); }}
            >
                {region.title}
            </ListItem>
        );
    }

    renderRegionDetails = ({
        projectDetails = emptyObject,
        selectedRegion,
        readOnly,
    }) => {
        if ((projectDetails.regions || emptyList).length > 0) {
            return (
                <ProjectRegionDetail
                    className={styles.regionDetailsContainer}
                    key={selectedRegion}
                    countryId={selectedRegion}
                    projectId={projectDetails.id}
                    onRegionClone={this.handleRegionClone}
                    readOnly={readOnly}
                />
            );
        }

        const noRegionText = _ts('project', 'noRegionText');
        return (
            <div className={styles.noRegions}>
                { noRegionText }
            </div>
        );
    }

    renderAddRegionForm = () => {
        const { projectDetails } = this.props;
        const { selectedAddRegionOption } = this.state;

        if (selectedAddRegionOption === 'old') {
            return (
                <AddExistingRegion
                    className={styles.addExistingRegion}
                    projectId={projectDetails.id}
                    onModalClose={this.handleModalClose}
                    onRegionsAdd={this.handleAddedRegions}
                />
            );
        }

        return (
            <AddRegion
                className={styles.addRegion}
                projectId={projectDetails.id}
                onModalClose={this.handleModalClose}
                onRegionAdd={this.handleAddedRegion}
            />
        );
    }

    renderAddRegionModal = () => {
        const {
            showAddRegionModal,
            selectedAddRegionOption,
        } = this.state;

        if (!showAddRegionModal) {
            return null;
        }

        const title = _ts('project', 'addRegionModalTitle');
        const className = this.getModalClassName();
        const AddRegionForm = this.renderAddRegionForm;

        return (
            <Modal className={className}>
                <ModalHeader title={title} />
                <ModalBody className={styles.body}>
                    <RadioInput
                        className={styles.regionTypeInput}
                        name="region-type-input"
                        options={this.addRegionOptions}
                        onChange={this.handleRadioInputChange}
                        value={selectedAddRegionOption}
                    />
                    <AddRegionForm />
                </ModalBody>
            </Modal>
        );
    }

    renderRegionList = () => {
        const {
            displayRegionList,
            searchInputValue,
            pendingProjectOptions,
        } = this.state;
        const {
            readOnly,
        } = this.props;

        const sortedRegions = [...displayRegionList].sort(
            (a, b) => compareString(a.title, b.title),
        );

        const searchPlaceholder = _ts('project', 'searchRegionPlaceholder');
        const addRegionButtonLabel = _ts('project', 'addRegionButtonLabel');
        const regionLabel = _ts('project', 'regionLabel');

        return (
            <div className={styles.regionList}>
                <header className={styles.header}>
                    <h4 className={styles.heading}>
                        { regionLabel }
                    </h4>
                    <AccentButton
                        iconName={iconNames.add}
                        className={styles.addRegionButton}
                        onClick={this.handleAddRegionButtonClick}
                        disabled={readOnly || pendingProjectOptions}
                    >
                        {addRegionButtonLabel}
                    </AccentButton>
                    <SearchInput
                        className={styles.regionSearchInput}
                        onChange={this.handleSearchInputChange}
                        placeholder={searchPlaceholder}
                        value={searchInputValue}
                        showHintAndError={false}
                        showLabel={false}
                    />
                </header>
                <ListView
                    className={styles.content}
                    modifier={this.renderRegionListItem}
                    data={sortedRegions}
                    keySelector={this.calcRegionKey}
                />
            </div>
        );
    }

    render() {
        const {
            projectDetails,
            readOnly,
            className,
        } = this.props;

        const { selectedRegion } = this.state;

        const RegionDetails = this.renderRegionDetails;
        const RegionList = this.renderRegionList;
        const AddRegionModal = this.renderAddRegionModal;

        return (
            <div className={_cs(className, styles.projectRegions)}>
                <RegionList />
                <RegionDetails
                    readOnly={readOnly}
                    projectDetails={projectDetails}
                    selectedRegion={selectedRegion}
                />
                <AddRegionModal />
            </div>
        );
    }
}
