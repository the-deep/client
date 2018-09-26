/**
 * @author thenav56 <navinayer56@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Faram, {
    requiredCondition,
} from '#rscg/Faram';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import {
} from '#rest';
import {
    setProjectAction,
    setUserProjectAction,
    setUsergroupViewProjectAction,
} from '#redux';
import _ts from '#ts';

import ProjectCreateRequest from './requests/ProjectCreateRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    // TODO: Change to onModalClose
    handleModalClose: PropTypes.func.isRequired,

    setUserProject: PropTypes.func.isRequired,
    setUserProfileProject: PropTypes.func.isRequired,
    setUsergroupProject: PropTypes.func.isRequired,
    onProjectAdd: PropTypes.func,
    userId: PropTypes.number, // eslint-disable-line
    userGroups: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
    })),
};

const defaultProps = {
    className: '',
    userGroups: [],
    onProjectAdd: undefined,
};

const mapDispatchToProps = dispatch => ({
    setUserProject: params => dispatch(setProjectAction(params)),
    setUserProfileProject: params => dispatch(setUserProjectAction(params)),
    setUsergroupProject: params => dispatch(setUsergroupViewProjectAction(params)),
});

// TODO: Rename to ProjectAddForm or something similar
@connect(undefined, mapDispatchToProps)
export default class UserProjectAdd extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            pristine: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
        };

        this.projectCreateRequest = new ProjectCreateRequest({
            setState: v => this.setState(v),
            setUserProject: this.props.setUserProject,
            setUserProfileProject: this.props.setUserProfileProject,
            setUsergroupProject: this.props.setUsergroupProject,

            onProjectAdd: this.props.onProjectAdd,
            handleModalClose: this.props.handleModalClose,
        });
    }

    componentWillUnmount() {
        this.projectCreateRequest.stop();
    }

    // FORM RELATED

    changeCallback = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    failureCallback = (faramErrors) => {
        this.setState({ faramErrors });
    };

    successCallback = ({ title }) => {
        const { userGroups, userId } = this.props;
        this.projectCreateRequest.init(
            userId,
            { title, userGroups },
        ).start();
    };

    // BUTTONS
    handleModalClose = () => {
        this.props.handleModalClose();
    }

    render() {
        const { className: classNameFromProps } = this.props;

        const {
            faramValues,
            faramErrors,
            pending,
            pristine,
        } = this.state;

        const className = `
            ${classNameFromProps}
            ${styles.userProjectAddForm}
        `;

        return (
            <Faram
                className={className}
                onChange={this.changeCallback}
                onValidationFailure={this.failureCallback}
                onValidationSuccess={this.successCallback}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TextInput
                    faramElementName="title"
                    label={_ts('components.addProject', 'addProjectModalLabel')}
                    placeholder={_ts('components.addProject', 'addProjectModalPlaceholder')}
                    autoFocus
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.handleModalClose}>
                        {_ts('components.addProject', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        type="submit"
                        disabled={pending || !pristine}
                    >
                        {_ts('components.addProject', 'modalCreate')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
