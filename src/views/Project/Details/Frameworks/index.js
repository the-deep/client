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
    analysisFrameworkListSelector,
    projectDetailsSelector,

    setAnalysisFrameworksAction,
} from '#redux';
import _ts from '#ts';
import { iconNames } from '#constants';

import Details from './Details';
import AddFramework from './AddFramework';
import styles from './styles.scss';

import ProjectAfsGetRequest from './requests/AfsGetRequest';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    analysisFrameworkList: PropTypes.array.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,
    setAnalysisFrameworks: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFrameworkList: [],
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    analysisFrameworkList: analysisFrameworkListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFrameworks: params => dispatch(setAnalysisFrameworksAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectAnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            analysisFrameworkList,
            projectDetails,
        } = props;

        const displayAfList = [...analysisFrameworkList];

        let selectedAf;
        if (projectDetails.analysisFramework) {
            // if there is analysisFramework in current project
            selectedAf = projectDetails.analysisFramework;
        } else {
            // if not, get first
            selectedAf = displayAfList.length > 0 ? displayAfList[0].id : 0;
        }

        this.state = {
            showAddFrameworkModal: false,
            displayAfList,
            afLoading: false,
            searchInputValue: '',
            selectedAf,
        };

        this.afsRequest = new ProjectAfsGetRequest({
            setState: v => this.setState(v),
            setAnalysisFrameworks: this.props.setAnalysisFrameworks,
        });
        this.afsRequest.init();
    }

    componentWillMount() {
        this.afsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            analysisFrameworkList: newAnalysisFrameworkList,
            projectDetails: { analysisFramework: newAnalysisFramework },
        } = nextProps;
        const {
            analysisFrameworkList: oldAnalysisFrameworkList,
            projectDetails: { analysisFramework: oldAnalysisFramework },
        } = nextProps;
        if (
            newAnalysisFrameworkList !== oldAnalysisFrameworkList ||
            newAnalysisFramework !== oldAnalysisFramework
        ) {
            // why filter again?
            const { searchInputValue } = this.state;
            const displayAfList = newAnalysisFrameworkList.filter(
                af => caseInsensitiveSubmatch(af.title, searchInputValue),
            );

            let selectedAf;
            if (newAnalysisFramework) {
                // if there is analysisFramework in current project
                selectedAf = newAnalysisFramework;
            } else {
                // if not, get first
                selectedAf = displayAfList.length > 0 ? displayAfList[0].id : 0;
            }

            this.setState({
                selectedAf,
                displayAfList,
            });
        }
    }

    componentWillUnmount() {
        this.afsRequest.stop();
    }

    handleAfClick = (afId) => {
        this.setState({ selectedAf: afId });
    }

    handleModalClose = () => {
        this.setState({ showAddFrameworkModal: false });
    }

    handleSearchInputChange = (searchInputValue) => {
        const { analysisFrameworkList } = this.props;
        const displayAfList = analysisFrameworkList.filter(
            af => caseInsensitiveSubmatch(af.title, searchInputValue),
        );

        this.setState({
            displayAfList,
            searchInputValue,
        });
    };

    handleAddAfButtonClick = () => {
        this.setState({ showAddFrameworkModal: true });
    }

    renderCheckmark = ({ afId }) => {
        const { projectDetails } = this.props;
        if (projectDetails.analysisFramework !== afId) {
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

    renderAFListItem = (key, af) => {
        const { selectedAf } = this.state;
        const isActive = af.id === selectedAf;
        const Checkmark = this.renderCheckmark;

        return (
            <ListItem
                active={isActive}
                className={styles.afListItem}
                key={af.id}
                onClick={() => this.handleAfClick(af.id)}
            >
                {af.title}
                <Checkmark afId={af.id} />
            </ListItem>
        );
    }

    renderSelectedAfDetails = () => {
        const { selectedAf } = this.state;
        const { analysisFrameworkList } = this.props;

        const noAFText = _ts('project', 'noAfText');

        if (analysisFrameworkList.length <= 0) {
            return (
                <Message>
                    { noAFText }
                </Message>
            );
        }

        return (
            <Details
                analysisFrameworkId={selectedAf}
            />
        );
    }

    renderFrameworkList = () => {
        const {
            searchInputValue,
            displayAfList,
        } = this.state;

        const searchAFPlaceholder = _ts('project', 'searchAfPlaceholder');
        const addAFButtonLabel = _ts('project', 'addAfButtonLabel');

        const sortedAfs = [...displayAfList].sort(
            (a, b) => compareString(a.title, b.title),
        );

        const headingText = _ts('project', 'afListHeading');

        return (
            <div className={styles.afList}>
                <header className={styles.header}>
                    <h4 className={styles.heading}>
                        { headingText }
                    </h4>
                    <AccentButton
                        className={styles.addAfButton}
                        iconName={iconNames.add}
                        onClick={this.handleAddAfButtonClick}
                    >
                        {addAFButtonLabel}
                    </AccentButton>
                    <SearchInput
                        className={styles.searchAfInput}
                        value={searchInputValue}
                        onChange={this.handleSearchInputChange}
                        placeholder={searchAFPlaceholder}
                        showHintAndError={false}
                        showLabel={false}
                    />
                </header>
                <ListView
                    data={sortedAfs}
                    className={styles.content}
                    modifier={this.renderAFListItem}
                />
            </div>
        );
    }

    renderAddFrameworkModal = () => {
        const { showAddFrameworkModal } = this.state;
        const { projectId } = this.props;

        if (!showAddFrameworkModal) {
            return null;
        }

        const addAFModalTitle = _ts('project', 'addAfModalTitle');

        return (
            <Modal>
                <ModalHeader title={addAFModalTitle} />
                <ModalBody>
                    <AddFramework
                        projectId={projectId}
                        onModalClose={this.handleModalClose}
                    />
                </ModalBody>
            </Modal>
        );
    }

    render() {
        const { afLoading } = this.state;
        const AFDetails = this.renderSelectedAfDetails;

        const AddAFModal = this.renderAddFrameworkModal;
        const AnalysisFrameworkList = this.renderFrameworkList;

        return (
            <div className={styles.projectAnalysisFramework}>
                <AnalysisFrameworkList />
                <div className={styles.detailsContainer}>
                    {afLoading && <LoadingAnimation large />}
                    <AFDetails />
                </div>
                <AddAFModal />
            </div>
        );
    }
}
