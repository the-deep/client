/**
 * @author thenav56 <navinayer56@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram, { requiredCondition } from '@togglecorp/faram';

import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import SegmentInput from '#rsci/SegmentInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import Cloak from '#components/general/Cloak';
import {
    setProjectAction,
    setUserProjectAction,
    setUsergroupViewProjectAction,
} from '#redux';
import _ts from '#ts';

import ProjectCreateRequest from './requests/ProjectCreateRequest';

import styles from './styles.scss';

// Note: Key is set according to is_private option
const projectVisibilityOptions = [
    { key: false, label: _ts('components.addProject', 'visibilityPublicLabel') },
    { key: true, label: _ts('components.addProject', 'visibilityPrivateLabel') },
];

const propTypes = {
    className: PropTypes.string,
    onModalClose: PropTypes.func.isRequired,

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

@connect(undefined, mapDispatchToProps)
export default class ProjectAddForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHidePrivate = ({ accessPrivateProject }) => !accessPrivateProject;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {
<<<<<<< HEAD
                isPrivate: false,
=======
                visibility: 'public',
>>>>>>> Add private project option in the new project modal
            },
            pending: false,
            pristine: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                isPrivate: [],
            },
        };

        this.projectCreateRequest = new ProjectCreateRequest({
            setState: v => this.setState(v),
            setUserProject: this.props.setUserProject,
            setUserProfileProject: this.props.setUserProfileProject,
            setUsergroupProject: this.props.setUsergroupProject,

            onProjectAdd: this.props.onProjectAdd,
            onModalClose: this.props.onModalClose,
        });
    }

    componentWillUnmount() {
        this.projectCreateRequest.stop();
    }

    onModalClose = () => {
        this.props.onModalClose();
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

    successCallback = ({
        title,
        isPrivate,
    }) => {
        const { userGroups, userId } = this.props;
        this.projectCreateRequest.init(
            userId,
            {
                title,
                userGroups,
                isPrivate,
            },
        ).start();
    };

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
<<<<<<< HEAD
                <Cloak
                    hide={ProjectAddForm.shouldHidePrivate}
                    render={
                        <SegmentInput
                            options={projectVisibilityOptions}
                            className={styles.isPrivateCheckbox}
                            faramElementName="isPrivate"
                            label={_ts('components.addProject', 'projectVisibilityInputLabel')}
                            hint={_ts('components.addProject', 'projectVisibilityInputHint')}
                        />
                    }
=======
                {/* Cloak according to user permission */}
                <SegmentInput
                    options={projectVisibilityOptions}
                    className={styles.isPrivateCheckbox}
                    faramElementName="visibility"
                    label={_ts('components.addProject', 'projectVisibilityInputLabel')}
                    hint={_ts('components.addProject', 'projectVisibilityInputHint')}
>>>>>>> Add private project option in the new project modal
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.onModalClose}>
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
