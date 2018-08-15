/**
 * @author thenav56 <navinayer56@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '#rsu/rest';
import Faram, {
    requiredCondition,
} from '#rscg/Faram';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import {
    alterResponseErrorToFaramError,
    createParamsForProjectCreate,
    urlForProjectCreate,
} from '#rest';
import {
    setUserProjectAction,
    setProjectAction,
    activeUserSelector,
} from '#redux';
import schema from '#schema';

import _ts from '#ts';
import notify from '#notify';
import styles from './styles.scss';

const propTypes = {
    handleModalClose: PropTypes.func.isRequired,
    setUserProject: PropTypes.func.isRequired,
    setProject: PropTypes.func.isRequired,
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
    setProject: params => dispatch(setProjectAction(params)),
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
    }

    componentWillUnmount() {
        if (this.projectCreateRequest) {
            this.projectCreateRequest.stop();
        }
    }

    createRequestForProjectCreate = ({ title }) => {
        const { userGroups } = this.props;

        const projectCreateRequest = new FgRestBuilder()
            .url(urlForProjectCreate)
            .params(() => createParamsForProjectCreate({ title, userGroups }))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'projectCreateResponse');
                    this.props.setProject({ project: response });
                    this.props.setUserProject({
                        userId: this.props.activeUser.userId,
                        project: response,
                    });
                    if (this.props.onProjectAdded) {
                        this.props.onProjectAdded(response.id);
                    }
                    notify.send({
                        title: _ts('components.addProject', 'userProjectCreate'),
                        type: notify.type.SUCCESS,
                        message: _ts('components.addProject', 'userProjectCreateSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.handleModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                // FIXME: no need to use notify here
                notify.send({
                    title: _ts('components.addProject', 'userProjectCreate'),
                    type: notify.type.ERROR,
                    message: _ts('components.addProject', 'userProjectCreateFailure'),
                    duration: notify.duration.MEDIUM,
                });
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.setState({ faramErrors });
            })
            .fatal(() => {
                // FIXME: no need to use notify here
                notify.send({
                    title: _ts('components.addProject', 'userProjectCreate'),
                    type: notify.type.ERROR,
                    message: _ts('components.addProject', 'userProjectCreateFatal'),
                    duration: notify.duration.SLOW,
                });
                // FIXME: use strings
                this.setState({
                    faramErrors: { $internal: ['Error while trying to save project.'] },
                });
            })
            .build();
        return projectCreateRequest;
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

    successCallback = (values) => {
        if (this.projectCreateRequest) {
            this.projectCreateRequest.stop();
        }

        this.projectCreateRequest = this.createRequestForProjectCreate(values);
        this.projectCreateRequest.start();
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
