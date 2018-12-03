import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { FgRestBuilder } from '#rsu/rest';

import AppLoading from '#components/AppLoading';
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
    createParamsForTokenRefresh,
    urlForTokenRefresh,
} from '#rest';
import {
    startSiloBackgroundTasksAction,
    stopSiloBackgroundTasksAction,
} from '#redux/middlewares/siloBackgroundTasks';
import { TabStatusSetter } from '#redux/middlewares/tasks/TabStatusManager';
import {
    setAccessTokenAction,
    logoutAction,
    tokenSelector,
    activeUserSelector,
    readySelector,
    globalSelectedLanguageNameSelector,
} from '#redux';
import getUserConfirmation from '#utils/getUserConfirmation';

import schema from '#schema';

import Multiplexer from './Multiplexer';

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
    selectedLanguageName: globalSelectedLanguageNameSelector(state),
    token: tokenSelector(state),
    ready: readySelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAccessToken: access => dispatch(setAccessTokenAction(access)),
    startSiloTasks: params => dispatch(startSiloBackgroundTasksAction(params)),
    stopSiloTasks: () => dispatch(stopSiloBackgroundTasksAction()),
    logout: () => dispatch(logoutAction()),
});

const propTypes = {
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    selectedLanguageName: PropTypes.string.isRequired,
    setAccessToken: PropTypes.func.isRequired,
    startSiloTasks: PropTypes.func.isRequired,
    stopSiloTasks: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    logout: PropTypes.func.isRequired,
    ready: PropTypes.bool.isRequired,
};

@connect(mapStateToProps, mapDispatchToProps)
export default class App extends React.PureComponent {
    static propTypes = propTypes;

    componentWillMount() {
        // Initialize google analytics
        initializeGa();
        // Initialize sentry
        ravenInitialize();

        // If there is no refresh token, no need to get a new access token
        const { token: { refresh: refreshToken } } = this.props;
        if (!refreshToken) {
            console.info('There is no previous session');
            return;
        }

        // Create rest request to get a new access token from refresh token
        this.refreshRequest = this.createRequestForRefresh();
        this.refreshRequest.start();

        this.tabStatusSetter = new TabStatusSetter();
        this.tabStatusSetter.start();
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
        if (this.refreshRequest) {
            this.refreshRequest.stop();
        }

        const { stopSiloTasks } = this.props;
        stopSiloTasks();

        clearInterval(this.pageStatusInterval);
        this.tabStatusSetter.stop();
    }

    createRequestForRefresh = () => {
        const {
            token: { refresh },
            setAccessToken,
            startSiloTasks,
            logout,
        } = this.props;

        const refreshRequest = new FgRestBuilder()
            .url(urlForTokenRefresh)
            .params(() => createParamsForTokenRefresh({ refresh }))
            .success((response) => {
                try {
                    schema.validate(response, 'tokenRefreshResponse');

                    const { access } = response;
                    setAccessToken(access);

                    // Start the locked silo tasks
                    startSiloTasks(() => console.log('Silo tasks started'));
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const { stopSiloTasks } = this.props;

                stopSiloTasks();
                logout();
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                // TODO: notify something wrong with the internet or server
            })
            .build();
        return refreshRequest;
    }

    render() {
        if (!this.props.ready) {
            return <AppLoading />;
        }

        return (
            <BrowserRouter getUserConfirmation={getUserConfirmation}>
                <Multiplexer />
            </BrowserRouter>
        );
    }
}
