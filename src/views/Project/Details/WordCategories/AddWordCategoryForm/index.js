import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram, {
    requiredCondition,
} from '@togglecorp/faram';

import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import { addNewCeAction } from '#redux';
import _ts from '#ts';

import CeCreateRequest from './requests/CeCreateRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    addNewCe: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    setActiveWordCategory: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapDispatchToProps = dispatch => ({
    addNewCe: params => dispatch(addNewCeAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class AddCategoryEditor extends React.PureComponent {
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

        this.ceCreateRequest = new CeCreateRequest({
            setState: v => this.setState(v),
            addNewCe: this.props.addNewCe,
            onModalClose: this.props.onModalClose,
            setActiveWordCategory: this.props.setActiveWordCategory,
        });
    }

    componentWillUnmount() {
        this.ceCreateRequest.stop();
    }

    // faram RELATED
    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleValidationSuccess = (values) => {
        this.ceCreateRequest.init(values).start();
    };

    render() {
        const {
            faramErrors,
            faramValues,
            pending,
            pristine,
        } = this.state;

        const { className } = this.props;

        return (
            <Faram
                className={`${className} ${styles.addCategoryEditorForm}`}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TextInput
                    label={_ts('project', 'addAfTitleLabel')}
                    faramElementName="title"
                    placeholder={_ts('project', 'addCeTitlePlaceholder')}
                    autoFocus
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.props.onModalClose}>
                        {_ts('project', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {_ts('project', 'modalAdd')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
