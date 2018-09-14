import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import ModalFooter from '#rscv/Modal/Footer';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Faram, {
    requiredCondition,
} from '#rscg/Faram';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';

import {
    analysisFrameworkDetailSelector,
    setAfDetailAction,
} from '#redux';
import { iconNames } from '#constants';
import _ts from '#ts';

import AfPutRequest from './requests/AfPutRequest';

import styles from './styles.scss';

const propTypes = {
    // Own Props
    analysisFrameworkId: PropTypes.number.isRequired,
    onModalClose: PropTypes.func.isRequired,

    // State Props
    frameworkDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setFrameworkDetails: PropTypes.func.isRequired,
};

const defaultProps = {};

const mapStateToProps = (state, props) => ({
    frameworkDetails: analysisFrameworkDetailSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setFrameworkDetails: params => dispatch(setAfDetailAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectAfDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramValues: props.frameworkDetails,
            faramErrors: {},
            pristine: true,
            pending: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                description: [],
            },
        };

        this.afPutRequest = new AfPutRequest({
            setState: v => this.setState(v),
            setFrameworkDetails: this.props.setFrameworkDetails,
            onModalClose: this.props.onModalClose,
        });
    }

    componentWillUnmount() {
        this.afPutRequest.stop();
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: true,
        });
    };

    handleValidationSuccess = (values) => {
        const { analysisFrameworkId: afId } = this.props;
        this.afPutRequest.init(afId, values).start();
    };

    render() {
        const { onModalClose } = this.props;
        const {
            faramErrors,
            faramValues,
            pristine,
            pending,
        } = this.state;

        return (
            <Modal className={styles.editFrameworkModal}>
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
                    <ModalHeader
                        title={_ts('project', 'editFrameworkModalTitle')}
                        rightComponent={
                            <Button
                                onClick={onModalClose}
                                transparent
                                iconName={iconNames.close}
                            />
                        }
                    />
                    <ModalBody>
                        { pending && <LoadingAnimation /> }
                        <NonFieldErrors faramElement />
                        <TextInput
                            className={styles.name}
                            label={_ts('project', 'addAfTitleLabel')}
                            faramElementName="title"
                            placeholder={_ts('project', 'addAfTitlePlaceholder')}
                        />
                        <TextArea
                            className={styles.description}
                            label={_ts('project', 'projectDescriptionLabel')}
                            faramElementName="description"
                            placeholder={_ts('project', 'projectDescriptionPlaceholder')}
                            rows={3}
                        />
                    </ModalBody>
                    <ModalFooter className={styles.footer}>
                        <DangerButton
                            className={styles.button}
                            onClick={onModalClose}
                            disabled={pending}
                        >
                            {_ts('project', 'modalCancel')}
                        </DangerButton>
                        <SuccessButton
                            className={styles.button}
                            disabled={pending || pristine}
                            type="submit"
                        >
                            {_ts('project', 'modalSave')}
                        </SuccessButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
