import PropTypes from 'prop-types';
import React from 'react';

import WarningConfirmButton from '#rsca/ConfirmButton/WarningConfirmButton';

import {
    RequestClient,
    requestMethods,
} from '#request';
import _ts from '#ts';
import notify from '#notify';

const propTypes = {
    disabled: PropTypes.bool,
    frameworkTitle: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    useFrameworkRequest: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    frameworkId: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setProjectFramework: PropTypes.func.isRequired,
};

const defaultProps = {
    disabled: false,
};

const requests = {
    useFrameworkRequest: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/`,
        body: ({ props: { frameworkId: analysisFramework } }) => ({ analysisFramework }),
        method: requestMethods.PATCH,
        onFailure: ({ error: { faramErrors = {} } }) => {
            const message = (faramErrors.$internal || []).join(' ');
            notify.send({
                title: _ts('project.framework', 'frameworkUseNotifyTitle'),
                type: notify.type.ERROR,
                message,
                duration: notify.duration.MEDIUM,
            });
        },
        onSuccess: ({
            props: {
                projectId,
                frameworkId,
                setProjectFramework,
            },
        }) => {
            setProjectFramework({
                projectId,
                afId: frameworkId,
            });
        },
    },
};

@RequestClient(requests)
export default class UseFrameworkButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleFrameworkConfirmClose = () => {
        const { useFrameworkRequest } = this.props;

        useFrameworkRequest.do();
    }

    render() {
        const {
            frameworkTitle,
            disabled,
            useFrameworkRequest: { pending },
        } = this.props;

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
                disabled={disabled || pending}
                confirmationMessage={confirmationMessage}
            >
                { useFrameworkButtonLabel }
            </WarningConfirmButton>
        );
    }
}
