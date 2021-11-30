import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import '@the-deep/deep-ui/build/index.css';

import {
    RequestCoordinator,
    RequestClient,
} from '#request';
import AppLoading from '#components/general/AppLoading';
import {
    initializeGa,
    setGaUserId,
} from '#config/google-analytics';
import {
    ravenInitialize,
    setRavenUser,
} from '#config/sentry';
import {
    setZeUser,
    setZeLang,
} from '#config/zE';
import {
    startSiloBackgroundTasksAction,
    stopSiloBackgroundTasksAction,
} from '#redux/middlewares/siloBackgroundTasks';
import {
    setUserPreferencesAction,
    logoutAction,
    activeUserSelector,
    globalSelectedLanguageNameSelector,
} from '#redux';


import Multiplexer from './Multiplexer';

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
    selectedLanguageName: globalSelectedLanguageNameSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveUser: params => dispatch(setUserPreferencesAction(params)),
    startSiloTasks: params => dispatch(startSiloBackgroundTasksAction(params)),
    stopSiloTasks: () => dispatch(stopSiloBackgroundTasksAction()),
    logout: () => dispatch(logoutAction()),
});

const propTypes = {
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    selectedLanguageName: PropTypes.string.isRequired,
    setActiveUser: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    startSiloTasks: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    stopSiloTasks: PropTypes.func.isRequired,
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    logout: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
};

const requestOptions = {
    meRequest: {
        url: '/users/me',
        onMount: true,
        onSuccess: ({ props, response }) => {
            try {
                props.setActiveUser({ userPreferences: response });

                // Start the locked silo tasks
                props.startSiloTasks(() => console.log('Silo tasks started'));
            } catch (er) {
                console.error(er);
            }
        },
        onFailure: ({ props, error }) => {
            console.info('FAILURE:', error);
            props.stopSiloTasks();
            props.logout();
        },
        onFatal: (response) => {
            console.info('FATAL:', response);
            // TODO: notify something wrong with the internet or server
        },
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requestOptions)
export default class App extends React.PureComponent {
    static propTypes = propTypes;
    componentWillMount() {
        // Initialize google analytics
        initializeGa();
        // Initialize sentry
        ravenInitialize();

        // Create rest request to get a new access token from refresh token
    }

    componentWillReceiveProps(nextProps) {
        const { activeUser, selectedLanguageName } = nextProps;
        if (this.props.activeUser !== activeUser) {
            setGaUserId(activeUser.userId);
            setRavenUser(activeUser);
            setZeUser(activeUser);
        }
        if (this.props.selectedLanguageName !== selectedLanguageName) {
            setZeLang(selectedLanguageName);
        }
    }

    componentWillUnmount() {
        const { stopSiloTasks } = this.props;
        stopSiloTasks();
    }

    render() {
        const {
            requests: {
                meRequest: {
                    pending,
                },
            },
        } = this.props;

        if (pending) {
            return <AppLoading />;
        }

        return (
            <Multiplexer />
        );
    }
}
