import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import { reverseRoute } from '#rs/utils/common';
import Button from '#rs/components/Action/Button';

import {
    iconNames,
    pathNames,
} from '#constants/';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    // className: PropTypes.string,
    project: PropTypes.shape({
        id: PropTypes.number,
        role: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    // className: '',
};

export default class Actions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderButtons = () => {
        const { project } = this.props;

        switch (project.role) {
            case 'none':
                return (
                    <Button
                        iconName={iconNames.add}
                        title={_ts('discoverProjects.table', 'joinProjectTooltip')}
                        transparent
                    />
                );
            case 'admin': {
                const link = reverseRoute(
                    pathNames.projects,
                    { projectId: project.id },
                );
                return (
                    <Link
                        className={styles.editLink}
                        tabIndex="-1"
                        title={_ts('discoverProjects.table', 'editProjectTooltip')}
                        to={link}
                    >
                        <i className={iconNames.edit} />
                    </Link>
                );
            } case 'pending':
                return (
                    <span>Pending</span>
                );
            case 'rejected':
                return (
                    <span>Rejected</span>
                );
            default:
                return null;
        }
    }

    render() {
        const Buttons = this.renderButtons;

        return (
            <React.Fragment>
                <Buttons />
            </React.Fragment>
        );
    }
}
