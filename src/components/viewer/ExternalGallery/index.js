import PropTypes from 'prop-types';
import React from 'react';

import { FgRestBuilder } from '#rsu/rest';
import LoadingAnimation from '#rscv/LoadingAnimation';
import urlRegex from '#rsu/regexForWeburl';

import {
    createUrlForWebsiteFetch,
    createParamsForGet,
} from '#rest';
import _ts from '#ts';

import GalleryViewer from '../GalleryViewer';
import styles from './styles.scss';

function isUrlValid(url) {
    return url && urlRegex.test(url);
}

const propTypes = {
    className: PropTypes.string,
    url: PropTypes.string,
};

const defaultProps = {
    className: '',
    url: undefined,
};

const initialState = {
    canShowIframe: false,
    mimeType: undefined,
    httpsUrl: undefined,
    error: undefined,
};

export default class ExternalGallery extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);


        this.state = {
            pending: true,
            ...initialState,
        };
    }

    componentWillMount() {
        this.startRequest(this.props.url);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.url !== nextProps.url) {
            this.startRequest(nextProps.url);
        }
    }

    componentWillUnmount() {
        if (this.urlRequest) {
            this.urlRequest.stop();
        }
    }

    getHeaderValue = (headers, header) => {
        const tHeader = Object.keys(headers).find(
            key => key.toLowerCase() === header.toLowerCase(),
        );
        return headers[tHeader];
    }

    startRequest = (url) => {
        if (!isUrlValid(url)) {
            this.setState({
                ...initialState,
                pending: false,
            });
            return;
        }

        if (this.urlRequest) {
            this.urlRequest.stop();
        }
        this.urlRequest = this.createRequestForUrl(url);
        this.urlRequest.start();
    }

    createRequestForUrl = (url) => {
        const urlRequest = new FgRestBuilder()
            .url(createUrlForWebsiteFetch(url))
            .preLoad(() => { this.setState({ pending: true }); })
            .postLoad(() => { this.setState({ pending: false }); })
            .params(createParamsForGet)
            .success((response) => {
                try {
                    // FIXME: write schema
                    const { headers, httpsUrl } = response;
                    const contentType = this.getHeaderValue(headers, 'Content-Type');
                    const mimeType = contentType.split(';')[0].trim();

                    const xFrameOptions = this.getHeaderValue(headers, 'X-Frame-Options');
                    const contentSecurityPolicy = this.getHeaderValue(headers, 'Content-Security-Policy');
                    let canShowIframe = true;

                    // Older policy
                    if (xFrameOptions) {
                        const options = xFrameOptions.toLowerCase();
                        // TODO: allow-from check if deep url is allowed
                        if (options.match('sameorigin|deny|allow-from')) {
                            canShowIframe = false;
                        }
                    }

                    // New policy
                    if (canShowIframe && contentSecurityPolicy) {
                        const options = contentSecurityPolicy.toLowerCase();
                        // TODO: uri check if deep url is allowed
                        if (options.match('frame-ancestors')) {
                            canShowIframe = false;
                        }
                    }

                    this.setState({
                        error: undefined,
                        canShowIframe,
                        mimeType,
                        httpsUrl,
                    });
                } catch (err) {
                    console.warn('External Gallery Error', err);
                    this.setState({ ...initialState, error: 'Some error occurred' });
                }
            })
            .failure((response) => {
                // server can't fetch the url
                console.warn('Failure: ', response);
                this.setState({ ...initialState, error: response.error });
            })
            .fatal((response) => {
                // server can't fetch the url
                console.warn('Fatal: ', response);
                this.setState({ ...initialState, error: 'Some error occurred' });
            })
            .build();

        return urlRequest;
    }

    render() {
        const {
            pending,
            canShowIframe,
            mimeType,
            httpsUrl,
            error,
        } = this.state;

        const {
            className,
            url,
        } = this.props;

        if (pending) {
            return (
                <div className={`${styles.pendingContainer} ${className}`}>
                    <LoadingAnimation
                        message={_ts('components.externalGallery', 'gatheringWebsiteInfoLabel')}
                    />
                </div>
            );
        }

        // use supported doc viewer component
        return (
            <GalleryViewer
                {...this.props}
                className={className}
                url={httpsUrl || url}
                mimeType={mimeType}
                canShowIframe={canShowIframe}
                error={error}
            />
        );
    }
}
