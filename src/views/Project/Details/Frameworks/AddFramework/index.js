import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Faram, {
    requiredCondition,
} from '#rscg/Faram';

import { addNewAfAction } from '#redux';
import _ts from '#ts';

import AfPostRequest from './requests/AfPostRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    addNewAf: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    projectId: PropTypes.number,
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

const mapDispatchToProps = dispatch => ({
    addNewAf: params => dispatch(addNewAfAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class AddAnalysisFramework extends React.PureComponent {
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

        this.afCreateRequest = new AfPostRequest({
            setState: v => this.setState(v),
            addNewAf: this.props.addNewAf,
            onModalClose: this.props.onModalClose,
        });
    }

    componentWillUnmount() {
        this.afCreateRequest.stop();
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

    handleValidationSuccess = (data) => {
        const { projectId } = this.props;
        this.afCreateRequest.init(projectId, data).start();
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
                className={`${className} ${styles.addAnalysisFrameworkForm}`}
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
                    placeholder={_ts('project', 'addAfTitlePlaceholder')}
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
