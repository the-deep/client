import PropTypes from 'prop-types';
import React from 'react';

import AccentButton from '#rsca/Button/AccentButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';

import _ts from '#ts';
import { iconNames } from '#constants';

import AddFrameworkForm from '../../AddFrameworkForm';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number.isRequired,
    setActiveFramework: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

export default class AddFrameworkButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showAddFrameworkModal: false,
        };
    }

    handleAddFrameworkButtonClick = () => {
        this.setState({ showAddFrameworkModal: true });
    }

    handleAddProjectModalClose = () => {
        this.setState({ showAddFrameworkModal: false });
    }

    render() {
        const {
            projectId,
            className: classNameFromProps,
            setActiveFramework,
        } = this.props;

        const { showAddFrameworkModal } = this.state;

        const className = `
            ${classNameFromProps}
            ${styles.addFrameworkButton}
        `;
        return (
            <React.Fragment>
                <AccentButton
                    className={className}
                    iconName={iconNames.add}
                    onClick={this.handleAddFrameworkButtonClick}
                >
                    { _ts('project.framework', 'addFrameworkButtonLabel')}
                </AccentButton>
                { showAddFrameworkModal && (
                    <Modal className={styles.addFrameworkModal}>
                        <ModalHeader title={_ts('project.framework', 'addFrameworkModalTitle')} />
                        <ModalBody className={styles.modalBody}>
                            <AddFrameworkForm
                                projectId={projectId}
                                onModalClose={this.handleAddProjectModalClose}
                                setActiveFramework={setActiveFramework}
                            />
                        </ModalBody>
                    </Modal>
                )}
            </React.Fragment>
        );
    }
}
