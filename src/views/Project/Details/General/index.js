import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import LoadingAnimation from '#rscv/LoadingAnimation';
import DateInput from '#rsci/DateInput';
import TextArea from '#rsci/TextArea';
import TextInput from '#rsci/TextInput';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    pending: PropTypes.bool,
};

const defaultProps = {
    pending: false,
};

export default class ProjectGeneral extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            pending,
        } = this.props;

        return (
            <div className={styles.projectGeneral}>
                { pending && <LoadingAnimation /> }
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
            </div>
        );
    }
}
