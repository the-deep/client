import React from 'react';
import PropTypes from 'prop-types';

import Button from '#rsca/Button';
import _ts from '#ts';

const propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    clientId: PropTypes.string.isRequired,
    developerKey: PropTypes.string.isRequired,
    scope: PropTypes.string,
    viewId: PropTypes.string,
    origin: PropTypes.string,
    onChange: PropTypes.func,
    onAuthenticate: PropTypes.func,
    createPicker: PropTypes.func,
    multiselect: PropTypes.bool,
    navHidden: PropTypes.bool,
    disabled: PropTypes.bool,
    mimeTypes: PropTypes.arrayOf(PropTypes.string),
    // Callback when api is loaded successfully and ready to use
    onApiLoad: PropTypes.func,
};

const defaultProps = {
    className: '',
    children: undefined,
    onChange: () => {},
    onAuthenticate: () => {},
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    viewId: 'DOCS',
    multiselect: false,
    navHidden: false,
    disabled: false,
    createPicker: undefined,
    mimeTypes: undefined,
    origin: window.location.origin,
    onApiLoad: undefined,
};

const POLL_TIME = 3000;

export default class GooglePicker extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isGoogleReady = () => !!window.gapi
    static isGoogleAuthReady = () => !!window.gapi && !!window.gapi.auth2
    static isGooglePickerReady = () => !!window.google && !!window.google.picker

    static isReady = () => (
        GooglePicker.isGoogleReady()
        && GooglePicker.isGoogleAuthReady()
        && GooglePicker.isGooglePickerReady()
    )

    constructor(props) {
        super(props);

        this.state = {
            authApiReady: false,
            pickerApiReady: false,
        };
        this.mounted = false;
    }

    componentDidMount() {
        this.mounted = true;
        this.pollForReadyState();
    }

    componentWillUnmount() {
        clearTimeout(this.readyCheck);
        this.mounted = false;
    }

    onAuthApiLoad = () => {
        if (this.mounted) {
            this.setState({ authApiReady: true });
        }
    }

    onPickerApiLoad = () => {
        if (this.mounted) {
            this.setState({ pickerApiReady: true });
        }
    }

    onAuth = ({ access_token: accessToken, error }) => {
        if (!this.mounted) {
            return;
        }

        if (accessToken) {
            this.createPicker(accessToken);
        } else {
            console.warn('Google Auth Response:', error);
            this.props.onAuthenticate(undefined);
        }
    }

    handleChoose = () => {
        if (!GooglePicker.isReady()) {
            console.warn('GooglePicker api is not loaded');
            return;
        }

        const {
            clientId,
            scope,
        } = this.props;

        window.gapi.auth2.authorize(
            {
                client_id: clientId,
                scope,
            },
            this.onAuth,
        );
    }

    createPicker = (oauthToken) => {
        const {
            onAuthenticate,
            createPicker,
            viewId,
            mimeTypes,
            developerKey,
            onChange,
            origin,
            navHidden,
            multiselect,
        } = this.props;

        onAuthenticate(oauthToken);

        if (createPicker) {
            return createPicker(window.google, oauthToken);
        }

        const googleViewId = window.google.picker.ViewId[viewId];
        const view = new window.google.picker.View(googleViewId);

        if (!view) {
            console.warn('Can\'t find view by viewId');
            return undefined;
        }
        if (mimeTypes) {
            view.setMimeTypes(mimeTypes.join(','));
        }

        const picker = new window.google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(oauthToken)
            .setDeveloperKey(developerKey)
            .setCallback(onChange);
        if (origin) {
            picker.setOrigin(origin);
        }
        if (navHidden) {
            picker.enableFeature(window.google.picker.Feature.NAV_HIDDEN);
        }
        if (multiselect) {
            picker.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
        }
        picker.build().setVisible(true);

        return picker;
    }

    pollForReadyState = () => {
        if (!GooglePicker.isGoogleReady()) {
            this.readyCheck = setTimeout(this.pollForReadyState, POLL_TIME);
            return;
        }

        // only call when api is loaded,
        if (this.props.onApiLoad) {
            this.props.onApiLoad();
        }
        window.gapi.load('auth2', this.onAuthApiLoad);
        window.gapi.load('picker', this.onPickerApiLoad);
    };

    render() {
        const {
            className,
            disabled,
            children,
        } = this.props;

        const {
            authApiReady,
            pickerApiReady,
        } = this.state;

        const ready = authApiReady && pickerApiReady;

        return (
            <Button
                className={className}
                onClick={this.handleChoose}
                disabled={disabled}
                pending={!ready}
                transparent
            >
                { children || _ts('components.googlePicker', 'openGoogleChooserText') }
            </Button>
        );
    }
}
