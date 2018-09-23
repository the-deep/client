import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Faram, {
    requiredCondition,
} from '#rscg/Faram';

import { addNewAfAction } from '#redux';
import _ts from '#ts';

import FrameworkCreateRequest from './requests/FrameworkCreateRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    addNewFramework: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    projectId: PropTypes.number,
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

const mapDispatchToProps = dispatch => ({
    addNewFramework: params => dispatch(addNewAfAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class AddFrameworkForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            pristine: true,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                description: [],
            },
        };

        this.frameworkCreateRequest = new FrameworkCreateRequest({
            setState: v => this.setState(v),
            addNewFramework: this.props.addNewFramework,
            onModalClose: this.props.onModalClose,
        });
    }

    componentWillUnmount() {
        this.frameworkCreateRequest.stop();
    }

    // faram RELATED
    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleValidationSuccess = (data) => {
        const { projectId } = this.props;
        this.frameworkCreateRequest
            .init(projectId, data)
            .start();
    };

    render() {
        const {
            faramErrors,
            faramValues,
            pending,
            pristine,
        } = this.state;

        const {
            className: classNameFromProps,
            onModalClose,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.addAnalysisFrameworkForm}
        `;

        return (
            <Faram
                className={className}
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
                    className={styles.title}
                    label={_ts('project', 'addAfTitleLabel')}
                    faramElementName="title"
                    placeholder={_ts('project', 'addAfTitlePlaceholder')}
                    autoFocus
                />
                <TextArea
                    className={styles.description}
                    label={_ts('project', 'projectDescriptionLabel')}
                    faramElementName="description"
                    placeholder={_ts('project', 'projectDescriptionPlaceholder')}
                    rows={3}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={onModalClose}>
                        {_ts('project', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || pristine}
                        type="submit"
                    >
                        {_ts('project', 'modalAdd')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
