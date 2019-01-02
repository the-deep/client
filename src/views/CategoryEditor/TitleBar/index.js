import React from 'react';
import PropTypes from 'prop-types';

import { pathNames } from '#constants';

import SuccessButton from '#rsca/Button/SuccessButton';
import BackLink from '#components/BackLink';
import { reverseRoute } from '#rsu/common';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number.isRequired,
    title: PropTypes.string,
    saveButtonDisabled: PropTypes.bool.isRequired,
    onSaveButtonClick: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    title: '',
};

export default class TitleBar extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            projectId,
            title,
            saveButtonDisabled,
            onSaveButtonClick,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.titleBar}
        `;

        const exitPath = reverseRoute(pathNames.projects, { projectId });

        return (
            <div className={className}>
                <BackLink
                    className={styles.backButton}
                    defaultLink={{
                        pathname: exitPath,
                        hash: '#/categoryEditor',
                    }}
                />
                <h4 className={styles.heading}>
                    { title }
                </h4>
                <div className={styles.actionButtons}>
                    <SuccessButton
                        disabled={saveButtonDisabled}
                        onClick={onSaveButtonClick}
                    >
                        {_ts('categoryEditor', 'saveCeButtonLabel')}
                    </SuccessButton>
                </div>
            </div>
        );
    }
}
