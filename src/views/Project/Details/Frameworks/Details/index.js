import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { reverseRoute } from '#rsu/common';
import AccentButton from '#rsca/Button/AccentButton';
import WarningButton from '#rsca/Button/WarningButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Confirm from '#rscv/Modal/Confirm';
import Faram, {
    requiredCondition,
} from '#rscg/Faram';
import DangerButton from '#rsca/Button/DangerButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';

import {
    analysisFrameworkDetailSelector,
    projectDetailsSelector,
    setProjectAfAction,
    setAfDetailAction,
    addNewAfAction,
} from '#redux';
import {
    iconNames,
    pathNames,
} from '#constants';
import _ts from '#ts';

import ProjectPatchRequest from './requests/ProjectPatchRequest';
import AfCloneRequest from './requests/AfCloneRequest';
import AfPutRequest from './requests/AfPutRequest';

import styles from './styles.scss';

const propTypes = {
    frameworkDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,
    addNewAf: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectFramework: PropTypes.func.isRequired,
    setFrameworkDetails: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    frameworkDetails: analysisFrameworkDetailSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewAf: params => dispatch(addNewAfAction(params)),
    setProjectFramework: params => dispatch(setProjectAfAction(params)),
    setFrameworkDetails: params => dispatch(setAfDetailAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectAfDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { frameworkDetails } = props;

        this.state = {
            cloneConfirmModalShow: false,
            useConfirmModalShow: false,

            faramValues: { ...frameworkDetails },
            faramErrors: {},
            pristine: false,
            pending: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                description: [],
            },
        };

        // Requests
        this.projectPatchRequest = new ProjectPatchRequest({
            setState: v => this.setState(v),
            setProjectFramework: this.props.setProjectFramework,
        });
        this.afCloneRequest = new AfCloneRequest({
            setState: v => this.setState(v),
            addNewAf: this.props.addNewAf,
        });
        this.afPutRequest = new AfPutRequest({
            setState: v => this.setState(v),
            setFrameworkDetails: this.props.setFrameworkDetails,
        });
    }

    componentWillUnmount() {
        this.projectPatchRequest.stop();
        this.afCloneRequest.stop();
        this.afPutRequest.stop();
    }

    handleAfClone = (cloneConfirm, afId, projectId) => {
        if (cloneConfirm) {
            this.afCloneRequest.init(afId, projectId).start();
        }
        this.setState({ cloneConfirmModalShow: false });
    }

    handleAfUse = (useConfirm, afId, projectId) => {
        if (useConfirm) {
            this.projectPatchRequest.init(afId, projectId).start();
        }
        this.setState({ useConfirmModalShow: false });
    }

    handleAfCloneClick = () => {
        this.setState({ cloneConfirmModalShow: true });
    }

    handleAfUseClick = () => {
        this.setState({ useConfirmModalShow: true });
    }

    handlefaramCancel = () => {
        const { frameworkDetails } = this.props;

        this.setState({
            faramValues: { ...frameworkDetails },
            faramErrors: {},

            pristine: false,
            pending: false,
        });
    };

    // faram RELATED
    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    };

    handleValidationSuccess = (values) => {
        const { analysisFrameworkId: afId } = this.props;
        this.afPutRequest.init(afId, values).start();
        this.setState({ pristine: false });
    };

    renderUseFrameworkButton = () => {
        const {
            analysisFrameworkId,
            projectDetails,
        } = this.props;

        if (analysisFrameworkId === projectDetails.analysisFramework) {
            return null;
        }

        const { pending } = this.state;
        const useFrameworkButtonLabel = _ts('project', 'useAfButtonLabel');

        return (
            <WarningButton
                iconName={iconNames.check}
                onClick={this.handleAfUseClick}
                disabled={pending}
            >
                { useFrameworkButtonLabel }
            </WarningButton>
        );
    }

    renderEditFrameworkButton = () => {
        const {
            analysisFrameworkId,
            frameworkDetails,
        } = this.props;

        if (!frameworkDetails.isAdmin) {
            return null;
        }

        const { pending } = this.state;
        const editFrameworkButtonLabel = _ts('project', 'editAfButtonLabel');

        const params = {
            analysisFrameworkId,
        };

        return (
            <Link
                className={styles.editFrameworkLink}
                to={reverseRoute(pathNames.analysisFramework, params)}
                disabled={pending}
            >
                { editFrameworkButtonLabel }
            </Link>
        );
    }

    renderHeader = () => {
        const { frameworkDetails } = this.props;
        const { pending } = this.state;

        const UseFrameworkButton = this.renderUseFrameworkButton;
        const EditFrameworkButton = this.renderEditFrameworkButton;

        const cloneAndEditFrameworkButtonLabel = _ts('project', 'cloneEditAfButtonLabel');

        return (
            <header className={styles.header}>
                <h2>
                    {frameworkDetails.title}
                </h2>
                <div className={styles.actionButtons}>
                    <UseFrameworkButton />
                    <EditFrameworkButton />
                    <AccentButton
                        onClick={this.handleAfCloneClick}
                        disabled={pending}
                    >
                        { cloneAndEditFrameworkButtonLabel }
                    </AccentButton>
                </div>
            </header>
        );
    }

    render() {
        const {
            frameworkDetails,
            analysisFrameworkId,
            projectDetails,
        } = this.props;

        const {
            cloneConfirmModalShow,
            useConfirmModalShow,
            faramErrors,
            pristine,
            pending,
            faramValues,
        } = this.state;

        const Header = this.renderHeader;
        const readOnly = !frameworkDetails.isAdmin;

        return (
            <div className={styles.analysisFrameworkDetail}>
                { pending && <LoadingAnimation /> }
                <Header />
                <Faram
                    className={styles.afDetailForm}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleValidationFailure}
                    onValidationSuccess={this.handleValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={pending}
                >
                    { !readOnly &&
                        <div className={styles.actionButtons}>
                            <DangerButton
                                onClick={this.handlefaramCancel}
                                disabled={pending || !pristine}
                            >
                                {_ts('project', 'modalRevert')}
                            </DangerButton>
                            <SuccessButton
                                disabled={pending || !pristine}
                                type="submit"
                            >
                                {_ts('project', 'modalSave')}
                            </SuccessButton>
                        </div>
                    }
                    <NonFieldErrors faramElement />
                    <TextInput
                        label={_ts('project', 'addAfTitleLabel')}
                        faramElementName="title"
                        placeholder={_ts('project', 'addAfTitlePlaceholder')}
                        className={styles.name}
                        readOnly={readOnly}
                    />
                    <TextArea
                        label={_ts('project', 'projectDescriptionLabel')}
                        faramElementName="description"
                        placeholder={_ts('project', 'projectDescriptionPlaceholder')}
                        className={styles.description}
                        rows={3}
                        readOnly={readOnly}
                    />
                </Faram>
                <Confirm
                    show={useConfirmModalShow}
                    onClose={useConfirm => this.handleAfUse(
                        useConfirm, analysisFrameworkId, projectDetails.id,
                    )}
                >
                    <p>
                        { _ts('project', 'confirmUseAf', { title: frameworkDetails.title }) }
                    </p>
                    <p>
                        { _ts('project', 'confirmUseAfText') }
                    </p>
                </Confirm>
                <Confirm
                    show={cloneConfirmModalShow}
                    onClose={cloneConfirm => this.handleAfClone(
                        cloneConfirm, analysisFrameworkId, projectDetails.id,
                    )}
                >
                    <p>
                        { _ts('project', 'confirmCloneAf', { title: frameworkDetails.title }) }
                    </p>
                </Confirm>
            </div>
        );
    }
}
