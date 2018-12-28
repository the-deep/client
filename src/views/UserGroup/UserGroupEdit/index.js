/**
 * @author thenav56 <ayernavin@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Faram, { requiredCondition } from '#rscg/Faram';
import NonFieldErrors from '#rsci/NonFieldErrors';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';

import _ts from '#ts';
import { setUsergroupViewAction } from '#redux';

import UserGroupPatchRequest from '../requests/UserGroupPatchRequest';

import styles from './styles.scss';

const propTypes = {
    handleModalClose: PropTypes.func.isRequired,
    userGroup: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
    }).isRequired,
    setUsergroupView: PropTypes.func.isRequired,
};

const defaultProps = {};

const mapDispatchToProps = dispatch => ({
    setUsergroupView: params => dispatch(setUsergroupViewAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class UserGroupEdit extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {
                title: props.userGroup.title,
                description: props.userGroup.description,
            },
            pending: false,
            pristine: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                description: [],
            },
        };

        // Requests
        this.userGroupPatchRequest = new UserGroupPatchRequest({
            setState: params => this.setState(params),
            setUsergroupView: this.props.setUsergroupView,
            handleModalClose: this.props.handleModalClose,
        });
    }

    componentWillUnmount() {
        this.userGroupPatchRequest.stop();
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (values) => {
        this.userGroupPatchRequest.init(
            this.props.userGroup.id,
            values,
        ).start();
    };

    // BUTTONS
    handleFaramClose = () => {
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
                className={styles.userGroupEditForm}
                schema={this.schema}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TextInput
                    label={_ts('userGroup', 'addUserGroupModalLabel')}
                    faramElementName="title"
                    placeholder={_ts('userGroup', 'addUserGroupModalPlaceholder')}
                    autoFocus
                />
                <TextArea
                    label={_ts('userGroup', 'userGroupModalDescriptionLabel')}
                    faramElementName="description"
                    className={styles.description}
                    placeholder={_ts('userGroup', 'addUserGroupModalPlaceholder')}
                    rows={3}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.handleFaramClose}>
                        {_ts('userGroup', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {_ts('userGroup', 'modalSave')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
