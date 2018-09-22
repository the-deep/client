import PropTypes from 'prop-types';
import React from 'react';

import WarningButton from '#rsca/Button/WarningButton';
import Confirm from '#rscv/Modal/Confirm';

import { iconNames } from '#constants';
import _ts from '#ts';

import UseFrameworkRequest from './requests/UseFrameworkRequest';

const propTypes = {
    currentFrameworkId: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
    frameworkId: PropTypes.number.isRequired,
    frameworkTitle: PropTypes.string.isRequired,
    projectId: PropTypes.number.isRequired,
    setProjectFramework: PropTypes.func.isRequired,
};

const defaultProps = {
    disabled: false,
};

export default class UseFrameworkButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showConfirmation: false,
        };

        const { setProjectFramework } = this.props;

        this.useFrameworkRequest = new UseFrameworkRequest({
            setState: d => this.setState(d),
            setProjectFramework,
        });
    }

    handleClick = () => {
        this.setState({ showConfirmation: true });
    }

    handleFrameworkConfirmClose = (useConfirm) => {
        const {
            frameworkId,
            projectId,
        } = this.props;

        if (useConfirm) {
            this.useFrameworkRequest
                .init(frameworkId, projectId)
                .start();
        }

        this.setState({ showConfirmation: false });
    }

    render() {
        const {
            frameworkId,
            frameworkTitle,
            currentFrameworkId,
            disabled,
        } = this.props;

        if (frameworkId === currentFrameworkId) {
            // If current framework is already being used
            return null;
        }

        const { showConfirmation } = this.state;
        const useFrameworkButtonLabel = _ts('project', 'useAfButtonLabel');

        return (
            <React.Fragment>
                <WarningButton
                    iconName={iconNames.check}
                    onClick={this.handleClick}
                    disabled={disabled}
                >
                    { useFrameworkButtonLabel }
                </WarningButton>
                <Confirm
                    show={showConfirmation}
                    onClose={this.handleFrameworkConfirmClose}
                >
                    <p>
                        { _ts('project', 'confirmUseAf', { title: frameworkTitle }) }
                    </p>
                    <p>
                        { _ts('project', 'confirmUseAfText') }
                    </p>
                </Confirm>
            </React.Fragment>
        );
    }
}
