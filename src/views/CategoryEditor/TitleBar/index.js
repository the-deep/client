import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import {
    iconNames,
    pathNames,
} from '#constants';

import SuccessButton from '#rsca/Button/SuccessButton';
import BackLink from '#components/BackLink';
import { reverseRoute } from '#rsu/common';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

export default class TitleBar extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleSaveButtonClick = () => {
    }

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
