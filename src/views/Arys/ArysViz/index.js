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


const vizRendererUrl = process.env.REACT_APP_ARY_VIZ_URL || 'https://matthewsmawfield.github.io/deepviz-assessments/';

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.number.isRequired, // used by request
    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
    setDefaultRequestParams: PropTypes.func.isRequired,
};

@RequestCoordinator
@RequestClient(requestOptions)
export default class ArysViz extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            entriesDataUrl: undefined,
            assessmentsDataUrl: undefined,
        };
        this.props.setDefaultRequestParams({
            setEntriesDataUrl: this.setEntriesDataUrl,
            setAryDataUrl: this.setAryDataUrl,
        });
    }

    getVizRendererUrl = memoize(urls => (
        `${vizRendererUrl}?${p(urls)}`
    ))

    setEntriesDataUrl = (entriesDataUrl) => {
        this.setState({ entriesDataUrl });
    }

    setAryDataUrl = (assessmentsDataUrl) => {
        this.setState({ assessmentsDataUrl });
    }

    render() {
        const {
            requests: {
                arysVizGetRequest,
                entriesVizGetRequest,
            },
        } = this.props;
        const pending = arysVizGetRequest.pending || entriesVizGetRequest.pending;
        const responseError = arysVizGetRequest.responseError || entriesVizGetRequest.responseError;
        const {
            entriesDataUrl,
            assessmentsDataUrl,
        } = this.state;
        const urls = { entriesDataUrl, assessmentsDataUrl };
        const invalidDataUrl = (!entriesDataUrl || !assessmentsDataUrl);

        // NOTE: Show old data even if pending
        if (pending && invalidDataUrl) {
            return (
                <div className={styles.content}>
                    <LoadingAnimation />
                </div>
            );
        // NOTE: Show error if responseError or dataUrl is not defined
        } else if (responseError || invalidDataUrl) {
            return (
                <Message>
                    {_ts('project', 'arysVizErrorMessage')}
                </Message>
            );
        }

        return (
            <div className={styles.content}>
                {pending && <LoadingAnimation />}
                <iframe
                    className={styles.iframe}
                    title="Visualization"
                    src={this.getVizRendererUrl(urls)}
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>
        );
    }
}
