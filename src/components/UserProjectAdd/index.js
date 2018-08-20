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
    setUserProjectAction,
    activeUserSelector,
} from '#redux';
import _ts from '#ts';

import ProjectCreate from './requests/ProjectCreate';

import styles from './styles.scss';

const propTypes = {
    handleModalClose: PropTypes.func.isRequired,
    setUserProject: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onProjectAdded: PropTypes.func,
    userGroups: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
    })),
};

const defaultProps = {
    userGroups: [],
    onProjectAdded: undefined,
};

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserProject: params => dispatch(setUserProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
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

        this.projectCreateRequest = new ProjectCreate({
            setState: v => this.setState(v),
            setUserProject: this.props.setUserProject,
            onProjectAdded: this.props.onProjectAdded,
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
        const {
            userGroups,
            activeUser: { userId },
        } = this.props;
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
        const {
            faramValues,
            faramErrors,
            pending,
            pristine,
        } = this.state;

        return (
            <Faram
                className={styles.userProjectAddForm}
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
