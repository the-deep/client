import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { reverseRoute } from '#rsu/common';
import AccentConfirmButton from '#rsca/ConfirmButton/AccentConfirmButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import WarningConfirmButton from '#rsca/ConfirmButton/WarningConfirmButton';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    categoryEditorDetailSelector,
    projectDetailsSelector,

    setProjectCeAction,
    addNewCeAction,
} from '#redux';
import _ts from '#ts';
import {
    iconNames,
    pathNames,
} from '#constants';

import EditCategoryEditor from '../EditCategoryEditor';
import ProjectPatchRequest from './requests/ProjectPatchRequest';
import CeCloneRequest from './requests/CeCloneRequest';

import styles from './styles.scss';

const propTypes = {
    ceDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    categoryEditorId: PropTypes.number.isRequired,
    addNewCe: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectCe: PropTypes.func.isRequired,
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
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectCeDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showEditCategoryModal: false,

            pending: false,
        };

        this.projectPatchRequest = new ProjectPatchRequest({
            setState: v => this.setState(v),
            setProjectCe: this.props.setProjectCe,
        });
        this.ceCloneRequest = new CeCloneRequest({
            setState: v => this.setState(v),
            addNewCe: this.props.addNewCe,
        });
    }

    componentWillUnmount() {
        this.projectPatchRequest.stop();
        this.ceCloneRequest.stop();
    }

    handleCeClone = (ceId, projectId) => {
        this.ceCloneRequest.init(ceId, projectId).start();
    }

    handleCeUse = (ceId, projectId) => {
        this.projectPatchRequest.init(ceId, projectId).start();
    }

    handleEditCategoryButtonClick = () => {
        this.setState({ showEditCategoryModal: true });
    }

    handleEditCategoryModalClose = () => {
        this.setState({ showEditCategoryModal: false });
    }

    renderUseCeButton = () => {
        const {
            categoryEditorId,
            projectDetails,
            ceDetails,
        } = this.props;

        const { pending } = this.state;
        if (categoryEditorId === projectDetails.categoryEditor) {
            return null;
        }
        const confirmationMessage = (
            <Fragment>
                <p>
                    {_ts('project', 'confirmUseCe', {
                        title: (<b> {ceDetails.title} </b>),
                    })}
                </p>
                <p>
                    {_ts('project', 'confirmUseCeText')}
                </p>
            </Fragment>
        );

        return (
            <WarningConfirmButton
                iconName={iconNames.check}
                onClick={() => this.handleCeUse(categoryEditorId, projectDetails.id)}
                disabled={pending}
                confirmationMessage={confirmationMessage}
            >
                {_ts('project', 'useCeButtonLabel')}
            </WarningConfirmButton>
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
            <Fragment>
                <Link
                    className={styles.editCategoryEditorLink}
                    to={reverseRoute(pathNames.categoryEditor, params)}
                    disabled={pending}
                >
                    { editCeButtonLabel }
                </Link>
                <SuccessButton
                    onClick={this.handleEditCategoryButtonClick}
                    disabled={pending}
                    type="submit"
                >
                    {_ts('project', 'quickEditAfButtonLabel')}
                </SuccessButton>
            </Fragment>
        );
    }

    renderHeader = () => {
        const {
            ceDetails,
            categoryEditorId,
            projectDetails,
        } = this.props;

        const { pending } = this.state;

        const UseCeButton = this.renderUseCeButton;
        const EditCeButton = this.renderEditCeButton;
        const cloneCeConfirmaMessage = (
            <Fragment>
                <p>
                    {_ts('project', 'confirmCloneCe', {
                        title: <b>{ceDetails.title}</b>,
                    })}
                </p>
                <p>
                    {_ts('project', 'confirmCloneCeText')}
                </p>
            </Fragment>
        );

        return (
            <header className={styles.header}>
                <h2>
                    {ceDetails.title}
                </h2>
                <div className={styles.actionButtons}>
                    <UseCeButton />
                    <EditCeButton />
                    <AccentConfirmButton
                        onClick={() => this.handleCeClone(categoryEditorId, projectDetails.id)}
                        disabled={pending}
                        confirmationMessage={cloneCeConfirmaMessage}
                    >
                        {_ts('project', 'cloneEditCeButtonLabel')}
                    </AccentConfirmButton>
                </div>
            </header>
        );
    }

    render() {
        const { categoryEditorId } = this.props;

        const {
            showEditCategoryModal,
            pending,
        } = this.state;

        const Header = this.renderHeader;

        return (
            <div className={styles.categoryEditorDetail}>
                { pending && <LoadingAnimation /> }
                <Header />
                {
                    showEditCategoryModal &&
                        <EditCategoryEditor
                            categoryEditorId={categoryEditorId}
                            onModalClose={this.handleEditCategoryModalClose}
                        />
                }
            </div>
        );
    }
}
