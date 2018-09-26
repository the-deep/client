import PropTypes from 'prop-types';
import React from 'react';

import UserProjectAdd from '#components/UserProjectAdd';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';

import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    setActiveProject: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

export default class AddProjectButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showAddProjectModal: false,
        };
    }

    handleProjectAdd = (projectId) => {
        const { setActiveProject } = this.props;

        setActiveProject({ activeProject: projectId });
    }

    handleClick = () => {
        this.setState({ showAddProjectModal: true });
    }

    handleAddProjectModalClose = () => {
        this.setState({ showAddProjectModal: false });
    }

    render() {
        const { className: classNameFromProps } = this.props;

        const { showAddProjectModal } = this.state;

        const className = `
            ${classNameFromProps}
            ${styles.addProjectButton}
        `;

        return (
            <React.Fragment>
                <PrimaryButton
                    className={className}
                    onClick={this.handleClick}
                    iconName={iconNames.add}
                >
                    {_ts('project', 'addProjectButtonLabel')}
                </PrimaryButton>
                { showAddProjectModal && (
                    <Modal className={styles.addProjectModal}>
                        <ModalHeader title={_ts('project', 'addProjectModalTitle')} />
                        <ModalBody>
                            <UserProjectAdd
                                onProjectAdd={this.handleProjectAdd}
                                handleModalClose={this.handleAddProjectModalClose}
                            />
                        </ModalBody>
                    </Modal>
                )}
            </React.Fragment>
        );
    }
}
