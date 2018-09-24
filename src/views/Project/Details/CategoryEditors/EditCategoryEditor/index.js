import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Faram, {
    requiredCondition,
} from '#rscg/Faram';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';

import {
} from '#rest';
import {
    categoryEditorDetailSelector,

    setProjectCeAction,
    setCeDetailAction,
    addNewCeAction,
} from '#redux';
import { iconNames } from '#constants';
import _ts from '#ts';

import CePutRequest from './requests/CePutRequest';

import styles from './styles.scss';

const propTypes = {
    ceDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    categoryEditorId: PropTypes.number.isRequired,
    setCeDetail: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
};

const defaultProps = {};

const mapStateToProps = (state, props) => ({
    ceDetails: categoryEditorDetailSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewCe: params => dispatch(addNewCeAction(params)),
    setProjectCe: params => dispatch(setProjectCeAction(params)),
    setCeDetail: params => dispatch(setCeDetailAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class EditCategoryEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { ceDetails } = props;

        this.state = {
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

        this.cePutRequest = new CePutRequest({
            setState: v => this.setState(v),
            setCeDetail: this.props.setCeDetail,
            onModalClose: this.props.onModalClose,
        });
    }

    componentWillUnmount() {
        this.cePutRequest.stop();
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

    handleValidationSuccess = (values) => {
        const { categoryEditorId } = this.props;
        this.cePutRequest.init(categoryEditorId, values).start();
        this.setState({ pristine: false });
    };

    renderFaram = () => {
        const {
            ceDetails,
            onModalClose,
        } = this.props;

        const {
            faramErrors,
            pristine,
            pending,
            faramValues,
        } = this.state;

        const readOnly = !ceDetails.isAdmin;

        return (
            <div className={styles.categoryEditorDetail}>
                { pending && <LoadingAnimation /> }
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
                    <NonFieldErrors faramElement />
                    <TextInput
                        label={_ts('project', 'addCeTitleLabel')}
                        faramElementName="title"
                        placeholder={_ts('project', 'addCeTitlePlaceholder')}
                        className={styles.name}
                        readOnly={readOnly}
                    />
                    {
                        !readOnly &&
                        <div className={styles.actionButtons}>
                            <DangerButton
                                onClick={onModalClose}
                                disabled={pending}
                            >
                                {_ts('project', 'modalCancel')}
                            </DangerButton>
                            <SuccessButton
                                disabled={pending || !pristine}
                                type="submit"
                            >
                                {_ts('project', 'modalSave')}
                            </SuccessButton>
                        </div>
                    }
                </Faram>
            </div>
        );
    }

    render() {
        const { onModalClose } = this.props;
        const RenderFaram = this.renderFaram;

        return (
            <Modal>
                <ModalHeader
                    title={_ts('project', 'editFrameworkModalTitle')}
                    rightComponent={
                        <PrimaryButton
                            onClick={onModalClose}
                            transparent
                        >
                            <span className={iconNames.close} />
                        </PrimaryButton>
                    }
                />
                <ModalBody>
                    <RenderFaram />
                </ModalBody>
            </Modal>
        );
    }
}
