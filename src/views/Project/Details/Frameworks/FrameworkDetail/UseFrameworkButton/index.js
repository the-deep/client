import PropTypes from 'prop-types';
import React from 'react';

import WarningConfirmButton from '#rsca/ConfirmButton/WarningConfirmButton';

import _ts from '#ts';

import UseFrameworkRequest from './requests/UseFrameworkRequest';

const propTypes = {
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

        this.state = { pendingFrameworkUse: false };

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
            frameworkTitle,
            disabled,
        } = this.props;
        const { pendingFrameworkUse } = this.state;

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
                iconName="check"
                onClick={this.handleFrameworkConfirmClose}
                disabled={disabled || pendingFrameworkUse}
                confirmationMessage={confirmationMessage}
            >
                { useFrameworkButtonLabel }
            </WarningConfirmButton>
        );
    }
}
