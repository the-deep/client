import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import _ts from '#ts';
import { p } from '#config/rest';

import {
    RequestCoordinator,
    RequestClient,
} from '#request';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';

import requestOptions from './requests';
import styles from './styles.scss';


const vizRendererUrl = process.env.REACT_APP_ENTRY_VIZ_URL || 'https://the-deep.github.io/deepviz/';

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.number.isRequired, // used by request
    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
    setDefaultRequestParams: PropTypes.func.isRequired,
};

@RequestCoordinator
@RequestClient(requestOptions)
export default class EntriesViz extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            dataUrl: undefined,
        };
        this.props.setDefaultRequestParams({
            setState: params => this.setState(params),
        });
    }

    getVizRendererUrl = memoize(dataUrl => (
        `${vizRendererUrl}?${p({ dataUrl })}`
    ))

    render() {
        const {
            requests: {
                entriesVizGetRequest: {
                    pending,
                    responseError,
                },
            },
        } = this.props;
        const { dataUrl } = this.state;

        // NOTE: Show old data even if pending
        if (pending && !dataUrl) {
            return (
                <div className={styles.content}>
                    <LoadingAnimation />
                </div>
            );
        // NOTE: Show error if responseError or dataUrl is not defined
        } else if (responseError || !dataUrl) {
            return (
                <Message>
                    {_ts('project', 'entriesVizErrorMessage')}
                </Message>
            );
        }

        return (
            <div className={styles.content}>
                {pending && <LoadingAnimation />}
                <iframe
                    className={styles.iframe}
                    title="Visualization"
                    src={this.getVizRendererUrl(dataUrl)}
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>
        );
    }
}
