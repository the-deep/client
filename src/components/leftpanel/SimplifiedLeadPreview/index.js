import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

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

import HighlightedText from '#rscv/HighlightedText';
import styles from './styles.scss';

const emptyArray = [];

const highlightsTransformerForText = (highlights, extractedText) => {
    const newHighlights = highlights
        .filter(item => item.text)
        .map((item) => {
            const { text, key, color } = item;
            const start = extractedText.indexOf(text);
            const end = start + text.length;
            return {
                key,
                start,
                end,
                text,
                color,
            };
        })
        .filter(h => h.start >= 0)
        .sort((a, b) => a.start - b.start);
    return newHighlights;
};

const propTypes = {
    className: PropTypes.string,
    leadId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    highlights: PropTypes.arrayOf(PropTypes.object),
    highlightsTransformer: PropTypes.func,
    onClick: PropTypes.func,
};

const defaultProps = {
    className: '',
    leadId: undefined,
    highlights: [],
    onClick: undefined,
    highlightsTransformer: highlightsTransformerForText,
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
        };
    }

    componentDidMount() {
        this.create(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.leadId !== nextProps.leadId) {
            this.create(nextProps);
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

    calculateHighlights = memoize((transformer, highlights, extractedText) => {
        if (!highlights || !extractedText) {
            return emptyArray;
        }
        return transformer(highlights, extractedText);
    })

    rendererParams = () => ({
        onClick: this.props.onClick,
    })

    renderContent = () => {
        const {
            error,
            extractedText,
        } = this.state;
        const {
            highlights,
            highlightsTransformer,
        } = this.props;

        if (error) {
            return (
                <Message>
                    { error }
                </Message>
            );
        }
        if (!extractedText) {
            return (
                <Message>
                    {_ts('components.simplifiedLeadPreview', 'previewNotAvailable')}
                </Message>
            );
        }

        const sortedHighlights = this.calculateHighlights(
            highlightsTransformer,
            highlights,
            extractedText,
        );

        return (
            <HighlightedText
                className={styles.highlightedText}
                text={extractedText}
                highlights={sortedHighlights}
                rendererParams={this.rendererParams}
            />
        );
    }

    render() {
        const { className } = this.props;
        const { pending } = this.state;

        const Content = this.renderContent;

        return (
            <div className={`${className} ${styles.leadPreview}`}>
                { pending ? (
                    <LoadingAnimation
                        className={styles.loadingAnimation}
                        message={_ts('components.simplifiedLeadPreview', 'simplifyingLead')}
                    />
                ) : (
                    <Content />
                )}
            </div>
        );
    }
}
