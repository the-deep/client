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

import {
} from '#rest';
import {
    categoryEditorDetailSelector,
    projectDetailsSelector,

    setProjectCeAction,
    setCeDetailAction,
    addNewCeAction,
} from '#redux';
import _ts from '#ts';
import {
    iconNames,
    pathNames,
} from '#constants';

import ProjectPatchRequest from './requests/ProjectPatchRequest';
import CeCloneRequest from './requests/CeCloneRequest';
import CePutRequest from './requests/CePutRequest';

import styles from './styles.scss';

const propTypes = {
    ceDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    categoryEditorId: PropTypes.number.isRequired,
    addNewCe: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectCe: PropTypes.func.isRequired,
    setCeDetail: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    ceDetails: categoryEditorDetailSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewCe: params => dispatch(addNewCeAction(params)),
    setProjectCe: params => dispatch(setProjectCeAction(params)),
    setCeDetail: params => dispatch(setCeDetailAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectCeDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { ceDetails } = props;

        this.state = {
            cloneConfirmModalShow: false,
            useConfirmModalShow: false,

            faramValues: { ...ceDetails },
            faramErrors: {},
            pristine: false,
            pending: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
        };

        this.projectPatchRequest = new ProjectPatchRequest({
            setState: v => this.setState(v),
            setProjectCe: this.props.setProjectCe,
        });
        this.ceCloneRequest = new CeCloneRequest({
            setState: v => this.setState(v),
            addNewCe: this.props.addNewCe,
        });
        this.cePutRequest = new CePutRequest({
            setState: v => this.setState(v),
            setCeDetail: this.props.setCeDetail,
        });
    }

    componentWillUnmount() {
        this.projectPatchRequest.stop();
        this.cePutRequest.stop();
        this.ceCloneRequest.stop();
    }

    handleCeClone = (cloneConfirm, ceId, projectId) => {
        if (cloneConfirm) {
            this.ceCloneRequest.init(ceId, projectId).start();
        }
        this.setState({ cloneConfirmModalShow: false });
    }

    handleCeUse = (useConfirm, ceId, projectId) => {
        if (useConfirm) {
            this.projectPatchRequest.init(ceId, projectId).start();
        }
        this.setState({ useConfirmModalShow: false });
    }

    handleCeCloneClick = () => {
        this.setState({ cloneConfirmModalShow: true });
    }

    handleCeUseClick = () => {
        this.setState({ useConfirmModalShow: true });
    }

    // faram RELATED
    handleFaramChange = (values, faramErrors) => {
        this.setState({
            faramValues: values,
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

    handlefaramCancel = () => {
        const { ceDetails } = this.props;

        this.setState({
            faramValues: { ...ceDetails },
            faramErrors: {},
            pristine: false,
            pending: false,
        });
    };

    handleValidationSuccess = (values) => {
        const { categoryEditorId } = this.props;
        this.cePutRequest.init(categoryEditorId, values).start();
        this.setState({ pristine: false });
    };

    renderUseCeButton = () => {
        const {
            categoryEditorId,
            projectDetails,
        } = this.props;

        const { pending } = this.state;
        if (categoryEditorId === projectDetails.categoryEditor) {
            return null;
        }

        return (
            <WarningButton
                iconName={iconNames.check}
                onClick={this.handleCeUseClick}
                disabled={pending}
            >
                {_ts('project', 'useCeButtonLabel')}
            </WarningButton>
        );
    }

    renderEditCeButton = () => {
        const {
            ceDetails,
            categoryEditorId,
        } = this.props;

        if (!ceDetails.isAdmin) {
            return null;
        }
        const params = {
            categoryEditorId,
        };

        const { pending } = this.state;
        const editCeButtonLabel = _ts('project', 'editCeButtonLabel');

        return (
            <Link
                className={styles.editCategoryEditorLink}
                to={reverseRoute(pathNames.categoryEditor, params)}
                disabled={pending}
            >
                { editCeButtonLabel }
            </Link>
        );
    }

    renderHeader = () => {
        const { ceDetails } = this.props;

        const { pending } = this.state;

        const UseCeButton = this.renderUseCeButton;
        const EditCeButton = this.renderEditCeButton;

        return (
            <header className={styles.header}>
                <h2>
                    {ceDetails.title}
                </h2>
                <div className={styles.actionButtons}>
                    <UseCeButton />
                    <EditCeButton />
                    <AccentButton
                        onClick={this.handleCeCloneClick}
                        disabled={pending}
                    >
                        {_ts('project', 'cloneEditCeButtonLabel')}
                    </AccentButton>
                </div>
            </header>
        );
    }

    render() {
        const {
            ceDetails,
            categoryEditorId,
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
        const readOnly = !ceDetails.isAdmin;

        return (
            <div className={styles.categoryEditorDetail}>
                { pending && <LoadingAnimation /> }
                <Header />
                <Faram
                    className={styles.ceDetailForm}
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
                        label={_ts('project', 'addCeTitleLabel')}
                        faramElementName="title"
                        placeholder={_ts('project', 'addCeTitlePlaceholder')}
                        className={styles.name}
                        readOnly={readOnly}
                    />
                </Faram>
                <Confirm
                    show={useConfirmModalShow}
                    onClose={useConfirm => this.handleCeUse(
                        useConfirm, categoryEditorId, projectDetails.id,
                    )}
                >
                    <p>
                        {_ts('project', 'confirmUseCe', { title: ceDetails.title })}
                    </p>
                    <p>
                        {_ts('project', 'confirmUseCeText')}
                    </p>
                </Confirm>
                {/* FIXME: don't use inline functions */}
                <Confirm
                    show={cloneConfirmModalShow}
                    onClose={cloneConfirm => this.handleCeClone(
                        cloneConfirm, categoryEditorId, projectDetails.id,
                    )}
                >
                    <p>
                        {_ts('project', 'confirmCloneCe', { title: ceDetails.title })}
                    </p>
                    <p>
                        {_ts('project', 'confirmCloneCeText')}
                    </p>
                </Confirm>
            </div>
        );
    }
}
