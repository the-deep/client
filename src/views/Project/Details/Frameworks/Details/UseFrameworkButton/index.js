import PropTypes from 'prop-types';
import React from 'react';

import WarningConfirmButton from '#rsca/ConfirmButton/WarningConfirmButton';

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

        const { setProjectFramework } = this.props;

        this.state = { pending: false };

        this.useFrameworkRequest = new UseFrameworkRequest({
            setState: d => this.setState(d),
            setProjectFramework,
        });
    }

    handleFrameworkConfirmClose = () => {
        const {
            frameworkId,
            projectId,
        } = this.props;

        this.useFrameworkRequest
            .init(frameworkId, projectId)
            .start();
    }

    render() {
        const {
            frameworkId,
            frameworkTitle,
            currentFrameworkId,
            disabled,
        } = this.props;
        const { pending } = this.state;

        if (frameworkId === currentFrameworkId) {
            // If current framework is already being used
            return null;
        }

        const useFrameworkButtonLabel = _ts('project.framework', 'useFrameworkButtonTitle');
        const confirmationMessage = (
            <React.Fragment>
                <p>
                    { _ts('project.framework', 'confirmUseFramework', {
                        title: <b>{frameworkTitle}</b>,
                    }) }
                </p>
                <p>
                    { _ts('project.framework', 'confirmUseFrameworkText') }
                </p>
            </React.Fragment>
        );

        return (
            <WarningConfirmButton
                iconName={iconNames.check}
                onClick={this.handleFrameworkConfirmClose}
                disabled={disabled || pending}
                confirmationMessage={confirmationMessage}
            >
                { useFrameworkButtonLabel }
            </WarningConfirmButton>
        );
    }
}
