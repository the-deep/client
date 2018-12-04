import PropTypes from 'prop-types';
import React from 'react';

import { FgRestBuilder } from '#rsu/rest';
import { isFalsy } from '#rsu/common';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';

import {
    createParamsForGet,
    createUrlForLeadExtractionTrigger,
    createUrlForSimplifiedLeadPreview,
} from '#rest';
import _ts from '#ts';

import HighlightedText from '../HighlightedText';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    leadId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    highlights: PropTypes.arrayOf(PropTypes.object),
    renderer: PropTypes.func,
    rendererParams: PropTypes.func,
};

const defaultProps = {
    className: '',
    leadId: undefined,
    highlights: [],
    renderer: undefined,
    rendererParams: undefined,
};

export default class SimplifiedLeadPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
            error: undefined,
            extractedText: null,
            // extractedImages: [],
            highlights: [],
        };
    }

    componentDidMount() {
        this.calculateHighlights(this.props);
        this.create(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.leadId !== nextProps.leadId) {
            this.create(nextProps);
        }

        if (this.props.highlights !== nextProps.highlights) {
            this.calculateHighlights(nextProps);
        }
    }

    componentWillUnmount() {
        if (this.triggerRequest) {
            this.triggerRequest.stop();
        }
        if (this.previewRequest) {
            this.previewRequest.stop();
        }
    }

    create({ leadId, onLoad }) {
        if (!leadId) {
            return;
        }

        this.setState({ pending: true });
        this.hasTriggeredOnce = false;

        if (this.previewRequest) {
            this.previewRequest.stop();
        }
        this.previewRequest = this.createPreviewRequest(leadId, onLoad);
        this.previewRequest.start();
    }

    createTriggerRequest = (leadId, onLoad) => (
        new FgRestBuilder()
            .url(createUrlForLeadExtractionTrigger(leadId))
            .params(createParamsForGet)
            .success(() => {
                console.log(`Triggered lead extraction for ${leadId}`);
                this.previewRequest.stop();
                this.previewRequest = this.createPreviewRequest(leadId, onLoad);
                this.previewRequest.start();
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: _ts('components.simplifiedLeadPreview', 'serverErrorText'),
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: _ts('components.simplifiedLeadPreview', 'connectionFailureText'),
                });
            })
            .build()
    )

    createPreviewRequest = (leadId, onLoad) => (
        new FgRestBuilder()
            .url(createUrlForSimplifiedLeadPreview(leadId))
            .params(createParamsForGet)
            .maxPollAttempts(200)
            .pollTime(2000)
            .shouldPoll(response => (
                this.hasTriggeredOnce &&
                isFalsy(response.id)
            ))
            .success((response) => {
                if (isFalsy(response.text) && response.images.length === 0) {
                    this.setState({
                        pending: false,
                        error: _ts('components.simplifiedLeadPreview', 'serverErrorText'),
                    });
                } else {
                    this.setState({
                        pending: false,
                        error: undefined,
                        extractedText: response.text,
                        // extractedImages: response.images,
                    }, () => {
                        this.calculateHighlights(this.props);
                    });
                    if (onLoad) {
                        onLoad(response);
                    }
                }
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: _ts('components.simplifiedLeadPreview', 'serverErrorText'),
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: _ts('components.simplifiedLeadPreview', 'connectionFailureText'),
                });
            })
            .build()
    )

    calculateHighlights({ highlights }) {
        const { extractedText } = this.state;
        if (!extractedText || !highlights) {
            this.setState({ highlights: [] });
            return;
        }

        this.setState({
            highlights: highlights.map((item) => {
                const start = item.text ? extractedText.indexOf(item.text) : item.start;
                const end = item.text ? item.text.length + start : item.end;
                return {
                    start,
                    end,
                    item,
                    key: item.key,
                };
            }),
        });
    }

    renderContent = () => {
        const {
            rendererParams,
            renderer,
        } = this.props;

        const {
            error,
            extractedText,
            highlights,
            pending,
        } = this.state;

        if (pending) {
            return null;
        }

        if (error) {
            return (
                <Message className={styles.message}>
                    { error }
                </Message>
            );
        } else if (extractedText) {
            if (!renderer) {
                return (
                    <p className={styles.highlightedText}>
                        {extractedText}
                    </p>
                );
            }
            return (
                <HighlightedText
                    className={styles.highlightedText}
                    text={extractedText}
                    highlights={highlights}
                    renderer={renderer}
                    rendererParams={rendererParams}
                />
            );
        }

        return (
            <Message className={styles.message}>
                {_ts('components.simplifiedLeadPreview', 'previewNotAvailable')}
            </Message>
        );
    }

    render() {
        const { className } = this.props;
        const { pending } = this.state;

        const Content = this.renderContent;

        return (
            <div className={`${className} ${styles.leadPreview}`}>
                { pending && (
                    <LoadingAnimation
                        className={styles.loadingAnimation}
                        message={_ts('components.simplifiedLeadPreview', 'simplifyingLead')}
                    />
                )}
                <Content />
            </div>
        );
    }
}
