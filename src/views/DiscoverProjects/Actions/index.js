import PropTypes from 'prop-types';
import React from 'react';
import Button from '#rs/components/Action/Button';
import WarningButton from '#rs/components/Action/Button/WarningButton';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import { iconNames } from '#constants/';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    project: PropTypes.shape({
        id: PropTypes.number,
        role: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    className: '',
};

export default class Actions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.actions,
        ];

        return classNames.join(' ');
    }

    render() {
        const className = this.getClassName();
        const { project } = this.props;

        return (
            <div className={className}>
                {project.role === 'null' && (
                    <Button
                        iconName={iconNames.add}
                        title={_ts('discoverProjects.table', 'joinProjectTooltip')}
                        transparent
                    />
                )}
                {project.role === 'admin' && (
                    <React.Fragment>
                        <WarningButton
                            iconName={iconNames.edit}
                            title={_ts('discoverProjects.table', 'editProjectTooltip')}
                            transparent
                        />
                        <DangerButton
                            iconName={iconNames.delete}
                            title={_ts('discoverProjects.table', 'deleteProjectTooltip')}
                            transparent
                        />
                    </React.Fragment>
                )}
            </div>
        );
    }
}
