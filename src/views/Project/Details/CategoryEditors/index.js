import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { caseInsensitiveSubmatch, compareString } from '#rsu/common';
import AccentButton from '#rsca/Button/AccentButton';
import SearchInput from '#rsci/SearchInput';
import Message from '#rscv/Message';
import ListView from '#rscv/List/ListView';
import ListItem from '#rscv/List/ListItem';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';

import {
    categoryEditorListSelector,
    projectDetailsSelector,

    setCategoryEditorsAction,
} from '#redux';
import _ts from '#ts';
import { iconNames } from '#constants';

import CesRequest from './requests/CesRequest';

import Details from './Details';
import AddCategoryEditor from './AddCategoryEditor';
import styles from './styles.scss';

const propTypes = {
    categoryEditorList: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,
    setCategoryEditors: PropTypes.func.isRequired,
};

const defaultProps = {
    categoryEditorList: [],
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    categoryEditorList: categoryEditorListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setCategoryEditors: params => dispatch(setCategoryEditorsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectCategoryEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            categoryEditorList,
            projectDetails,
        } = props;

        const displayCeList = [...categoryEditorList];

        let selectedCe;
        if (projectDetails.categoryEditor) {
            // if there is categoryEditor in current project
            selectedCe = projectDetails.categoryEditor;
        } else {
            // if not, get first
            selectedCe = displayCeList.length > 0 ? displayCeList[0].id : 0;
        }

        this.state = {
            addCeModalShow: false,
            displayCeList,
            pending: false,
            searchInputValue: '',
            selectedCe,
        };
        this.cesRequest = new CesRequest({
            setState: v => this.setState(v),
            setCategoryEditors: this.props.setCategoryEditors,
        });
    }

    componentWillMount() {
        this.cesRequest.init().start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            categoryEditorList: newCategoryEditorList,
            projectDetails: { categoryEditor: newCategoryEditor },
        } = nextProps;
        const {
            categoryEditorList: oldCategoryEditorList,
            projectDetails: { categoryEditor: oldCategoryEditor },
        } = this.props;
        if (
            newCategoryEditorList !== oldCategoryEditorList ||
            newCategoryEditor !== oldCategoryEditor
        ) {
            // why filter again?
            const { searchInputValue } = this.state;
            const displayCeList = newCategoryEditorList.filter(
                ce => caseInsensitiveSubmatch(ce.title, searchInputValue),
            );

            let selectedCe;
            if (newCategoryEditor) {
                // if there is category editor in current project
                selectedCe = newCategoryEditor;
            } else {
                // if not, get first
                selectedCe = displayCeList.length > 0 ? displayCeList[0].id : 0;
            }

            this.setState({
                selectedCe,
                displayCeList,
            });
        }
    }

    componentWillUnmount() {
        this.cesRequest.stop();
    }

    handleCeClick = (ceId) => {
        this.setState({ selectedCe: ceId });
    }

    handleSearchInputChange = (searchInputValue) => {
        const { categoryEditorList } = this.props;
        const displayCeList = categoryEditorList.filter(
            ce => caseInsensitiveSubmatch(ce.title, searchInputValue),
        );

        this.setState({
            displayCeList,
            searchInputValue,
        });
    };

    handleAddCeButtonClick = () => {
        this.setState({ addCeModalShow: true });
    }

    handleModalClose = () => {
        this.setState({ addCeModalShow: false });
    }

    calcCeKey = ce => ce.id;

    renderCheckmark = ({ ceId }) => {
        const { projectDetails } = this.props;
        if (projectDetails.categoryEditor !== ceId) {
            return null;
        }

        const className = [
            iconNames.check,
            styles.check,
        ].join(' ');

        return (
            <span className={className} />
        );
    }

    renderCeList = (key, ce) => {
        const { selectedCe } = this.state;
        const isActive = ce.id === selectedCe;
        const Checkmark = this.renderCheckmark;

        return (
            <ListItem
                active={isActive}
                key={key}
                onClick={() => this.handleCeClick(ce.id)}
                className={styles.ceListItem}
            >
                {ce.title}
                <Checkmark ceId={ce.id} />
            </ListItem>
        );
    }

    renderCategoryEditorList = () => {
        const {
            displayCeList,
            searchInputValue,
        } = this.state;

        const sortedCes = [...displayCeList].sort(
            (a, b) => compareString(a.title, b.title),
        );

        // FIXME: use strings
        const headingText = 'Category Editors';

        return (
            <div className={styles.ceList}>
                <div className={styles.header}>
                    <h4 className={styles.heading}>
                        { headingText }
                    </h4>
                    <AccentButton
                        className={styles.addCeButton}
                        iconName={iconNames.add}
                        onClick={this.handleAddCeButtonClick}
                    >
                        {_ts('project', 'addCeButtonLabel')}
                    </AccentButton>
                    <SearchInput
                        className={styles.searchCeInput}
                        value={searchInputValue}
                        onChange={this.handleSearchInputChange}
                        placeholder={_ts('project', 'searchCePlaceholder')}
                        showHintAndError={false}
                        showLabel={false}
                    />
                </div>
                <ListView
                    className={styles.content}
                    modifier={this.renderCeList}
                    data={sortedCes}
                    keyExtractor={this.calcCeKey}
                />
            </div>
        );
    }

    renderSelectedCeDetails = () => {
        const { selectedCe } = this.state;
        const { categoryEditorList } = this.props;

        if (categoryEditorList.length <= 0) {
            return (
                <Message>
                    {_ts('project', 'noCeText')}
                </Message>
            );
        }

        return <Details categoryEditorId={selectedCe} />;
    }

    renderAddCeModal = () => {
        const { addCeModalShow } = this.state;

        const {
            projectId,
        } = this.props;

        if (!addCeModalShow) {
            return null;
        }

        return (
            <Modal
                closeOnEscape
                onClose={this.handleModalClose}
                closeOnBlur
            >
                <ModalHeader title={_ts('project', 'addCeModalTitle')} />
                <ModalBody>
                    <AddCategoryEditor
                        projectId={projectId}
                        onModalClose={this.handleModalClose}
                    />
                </ModalBody>
            </Modal>
        );
    }

    render() {
        const { pending } = this.state;
        const CeDetails = this.renderSelectedCeDetails;

        const CategoryEditorList = this.renderCategoryEditorList;
        const AddCeModal = this.renderAddCeModal;

        return (
            <div className={styles.projectCategoryEditor}>
                <CategoryEditorList />
                <div className={styles.detailsContainer}>
                    {pending && <LoadingAnimation large />}
                    <CeDetails />
                </div>
                <AddCeModal />
            </div>
        );
    }
}
