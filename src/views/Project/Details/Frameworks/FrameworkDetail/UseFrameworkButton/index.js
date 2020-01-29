import PropTypes from 'prop-types';
import React from 'react';

import WarningConfirmButton from '#rsca/ConfirmButton/WarningConfirmButton';

import {
    RequestClient,
    methods,
} from '#request';
import _ts from '#ts';
import notify from '#notify';

const propTypes = {
    disabled: PropTypes.bool,
    frameworkTitle: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    frameworkId: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setProjectFramework: PropTypes.func.isRequired,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    disabled: false,
    className: undefined,
};

const requestOptions = {
    useFrameworkRequest: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/`,
        body: ({ props: { frameworkId: analysisFramework } }) => ({ analysisFramework }),
        method: methods.PATCH,
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
        onFailure: ({ error: { faramErrors = {} } }) => {
            const message = (faramErrors.$internal || []).join(' ');
            notify.send({
                title: _ts('project.framework', 'frameworkUseNotifyTitle'),
                type: notify.type.ERROR,
                message,
                duration: notify.duration.MEDIUM,
            });
        },
    },
};

@RequestClient(requestOptions)
export default class UseFrameworkButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleFrameworkConfirmClose = () => {
        const {
            requests: {
                useFrameworkRequest,
            },
        } = this.props;

        useFrameworkRequest.do();
    }

    render() {
        const {
            frameworkTitle,
            disabled,
            requests: {
                useFrameworkRequest: { pending },
            },
            className,
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
                className={className}
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
