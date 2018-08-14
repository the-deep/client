import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    reverseRoute,
    compareString,
    compareDate,
} from '#rsu/common';
import update from '#rsu/immutable-update';

import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DateInput from '#rsci/DateInput';
import TextArea from '#rsci/TextArea';
import TextInput from '#rsci/TextInput';

import Faram, {
    requiredCondition,
    dateCondition,
} from '#rsci/Faram';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    projectId: PropTypes.number.isRequired,
};

const defaultProps = {
};

export default class ProjectGeneral extends PureComponent {
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
                startDate: [dateCondition],
                endDate: [dateCondition],
                description: [],
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    }

    handleFaramCancel = () => {
        this.setState({
            faramValues: {},
            faramErrors: {},
            pending: false,
            pristine: true,
        });
    }

    handleValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleValidationSuccess = (values) => {
        console.warn(values);
    }

    render() {
        const {
            faramErrors,
            faramValues,
            pending,
            pristine,
        } = this.state;

        const {
            projectId,
        } = this.props;

        const loading = pending;

        return (
            <Faram
                className={styles.projectGeneralForm}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={loading}
            >
                { loading && <LoadingAnimation /> }
                <div className={styles.actionButtons}>
                    <DangerButton
                        disabled={loading || pristine}
                        onClick={this.handleFaramCancel}
                    >
                        {_ts('project.general', 'cancelButtonLabel')}
                    </DangerButton>
                    <SuccessButton
                        disabled={loading || pristine}
                        type="submit"
                    >
                        {_ts('project.general', 'saveButtonLabel')}
                    </SuccessButton>
                </div>
                <div
                    className={styles.inputsContainer}
                >
                    <TextInput
                        label={_ts('project.general', 'projectNameLabel')}
                        faramElementName="title"
                        placeholder={_ts('project.general', 'projectNamePlaceholder')}
                        className={styles.name}
                    />
                    <DateInput
                        label={_ts('project.general', 'projectStartDateLabel')}
                        faramElementName="startDate"
                        placeholder={_ts('project.general', 'projectStartDatePlaceholder')}
                        className={styles.startDate}
                    />
                    <DateInput
                        label={_ts('project.general', 'projectEndDateLabel')}
                        faramElementName="endDate"
                        placeholder={_ts('project.general', 'projectEndDatePlaceholder')}
                        className={styles.endDate}
                    />
                </div>
                <TextArea
                    label={_ts('project.general', 'projectDescriptionLabel')}
                    faramElementName="description"
                    placeholder={_ts('project.general', 'projectDescriptionPlaceholder')}
                    className={styles.description}
                    rows={3}
                />
            </Faram>
        );
    }
}
