import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Message from '#rscv/Message';
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

import Details from './Details';
import AddFrameworkForm from './AddFrameworkForm';
import styles from './styles.scss';

import FrameworkListGetRequest from './requests/FrameworkListGetRequest';
import FrameworkList from './FrameworkList';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    frameworkList: PropTypes.array.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,
    setFrameworkList: PropTypes.func.isRequired,
};

const defaultProps = {
    frameworkList: [],
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    frameworkList: analysisFrameworkListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setFrameworkList: params => dispatch(setAnalysisFrameworksAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectAnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            frameworkList,
            projectDetails: {
                analysisFramework: activeFrameworkIdFromProjectDetails,
            },
        } = props;


        let activeFrameworkId;
        if (activeFrameworkIdFromProjectDetails) {
            activeFrameworkId = activeFrameworkIdFromProjectDetails;
        } else {
            activeFrameworkId = frameworkList.length > 0 ? frameworkList[0].id : undefined;
        }

        this.state = {
            showAddFrameworkModal: false,
            pendingFrameworkList: false,
            activeFrameworkId,
        };

        this.frameworkListRequest = new FrameworkListGetRequest({
            setState: v => this.setState(v),
            setFrameworkList: this.props.setFrameworkList,
        });
        this.frameworkListRequest.init();
    }

    componentWillMount() {
        this.frameworkListRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            frameworkList: newFrameworkList,
            projectDetails: { analysisFramework: newActiveFrameworkId },
        } = nextProps;

        const {
            frameworkList: oldFrameworkList,
            projectDetails: { analysisFramework: oldActiveFrameworkId },
        } = this.props;

        if (
            newFrameworkList !== oldFrameworkList ||
            newActiveFrameworkId !== oldActiveFrameworkId
        ) {
            let activeFrameworkId;

            if (newActiveFrameworkId) {
                activeFrameworkId = newActiveFrameworkId;
            } else {
                activeFrameworkId = newFrameworkList.length > 0 ?
                    newFrameworkList[0].id : undefined;
            }

            this.setState({ activeFrameworkId });
        }
    }

    componentWillUnmount() {
        this.frameworkListRequest.stop();
    }

    handleModalClose = () => {
        this.setState({ showAddFrameworkModal: false });
    }

    handleFrameworkClick = (id) => {
        this.setState({ activeFrameworkId: id });
    }

    renderActiveFrameworkDetails = () => {
        const { activeFrameworkId } = this.state;
        const noAFText = _ts('project', 'noAfText');

        if (!activeFrameworkId) {
            return (
                <Message>
                    { noAFText }
                </Message>
            );
        }

        return (
            <Details
                className={styles.details}
                analysisFrameworkId={activeFrameworkId}
            />
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
                    <AddFrameworkForm
                        projectId={projectId}
                        onModalClose={this.handleModalClose}
                    />
                </ModalBody>
            </Modal>
        );
    }

    render() {
        const {
            pendingFrameworkList,
            activeFrameworkId,
        } = this.state;

        const {
            frameworkList,
            projectDetails: {
                analysisFramework: selectedFrameworkId,
            },
        } = this.props;

        const ActiveFrameworkDetails = this.renderActiveFrameworkDetails;
        const AddAFModal = this.renderAddFrameworkModal;

        return (
            <div className={styles.projectAnalysisFramework}>
                <FrameworkList
                    className={styles.frameworkList}
                    onClick={this.handleFrameworkClick}
                    activeFrameworkId={activeFrameworkId}
                    selectedFrameworkId={selectedFrameworkId}
                    frameworkList={frameworkList}
                />
                { pendingFrameworkList ? (
                    <LoadingAnimation large />
                ) : (
                    <ActiveFrameworkDetails />
                )}
                <AddAFModal />
            </div>
        );
    }
}
