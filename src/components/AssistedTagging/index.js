import PropTypes from 'prop-types';
import React from 'react';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import WarningButton from '#rsca/Button/WarningButton';
import SegmentButton from '#rsca/SegmentButton';
import MultiSelectInput from '#rs/components/Input/MultiSelectInput';
import FloatingContainer from '#rs/components/View/FloatingContainer';
import ListView from '#rs/components/View/List/ListView';
import { getHexFromString } from '#rsu/common';
import { FgRestBuilder } from '#rsu/rest';

import { iconNames } from '#constants';
import notify from '#notify';
import {
    createParamsForCeClassify,
    createParamsForFeedback,
    createParamsForLeadClassify,
    createParamsForNer,
    createUrlForCeClassify,
    urlForFeedback,
    urlForLeadClassify,
    urlForNer,
} from '#rest';
import schema from '#schema';
import _ts from '#ts';

import Highlight from '../Highlight';
import SimplifiedLeadPreview from '../SimplifiedLeadPreview';
import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    onEntryAdd: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const emptyList = [];
const emptyObject = {};

// Cut off threshold for NLP classification's confidence
const NLP_THRESHOLD = 0.33;

export default class AssistedTagging extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showAssistant: false,
            showAssistantOptions: false,
            activeHighlightRef: undefined,
            activeHighlightDetails: emptyObject,
            nlpSectorOptions: emptyList,
            nlpSelectedSectors: emptyList,
            ceSectorOptions: emptyList,
            ceSelectedSectors: emptyList,
            nerSectorOptions: emptyList,
            nerSelectedSectors: emptyList,
            selectedAssitedTaggingSource: 'nlp',
            highlights: [],
            pendingNlpClassify: true,
            pendingNerClassify: true,
            pendingCeClassify: true,
        };

        this.assitedTaggingSources = [
            {
                label: _ts('components.assistedTagging', 'nlpLabel'),
                value: 'nlp',
            },
            {
                label: _ts('components.assistedTagging', 'entitiesLabel'),
                value: 'ner',
            },
            {
                label: _ts('components.assistedTagging', 'ceLabel'),
                value: 'ce',
            },
        ];
    }

    // FIXME: cancel requests and call anew if projectId has changed

    componentDidMount() {
        if (this.primaryContainer) {
            this.primaryContainerRect = this.primaryContainer.getBoundingClientRect();
        }
    }

    componentWillUnmount() {
        if (this.nlpClassifyRequest) {
            this.nlpClassifyRequest.stop();
        }

        if (this.ceClassifyRequest) {
            this.ceClassifyRequest.stop();
        }

        if (this.nerClassifyRequest) {
            this.nerClassifyRequest.stop();
        }

        if (this.feedbackRequest) {
            this.feedbackRequest.stop();
        }
    }

    getClassName = () => {
        const { className } = this.props;
        const {
            showAssistant,
            showAssistantOptions,
        } = this.state;

        const classNames = [
            className,
            styles.assistedTagging,
            'assisted-tagging',
        ];

        if (showAssistant) {
            classNames.push(styles.assistantShown);
            classNames.push('assistant-shown');
        }

        if (showAssistantOptions) {
            classNames.push(styles.assistantOptionsShown);
            classNames.push('assistant-option-shown');
        }

        return classNames.join(' ');
    }

    highlightRendererParams = () => ({
        onClick: this.handleHighlightClick,
    })

    handleAssitedBoxInvalidate = (popupContainer) => {
        const popupRect = popupContainer.getBoundingClientRect();
        const primaryContainerRect = this.primaryContainerRect || (
            this.primaryContainer && this.primaryContainer.getBoundingClientRect());

        if (!primaryContainerRect) {
            return null;
        }

        const newStyle = {
            left: `${primaryContainerRect.left + 48}px`,
            width: `${primaryContainerRect.width - 96}px`,
            top: `${(window.scrollY + (primaryContainerRect.height / 2)) - (popupRect.height / 2)}px`,
        };

        return newStyle;
    }

    handleAssitedTaggingSourceChange = (newSource) => {
        this.setState({
            selectedAssitedTaggingSource: newSource,
        }, () => this.refreshSelections());
    }

    handleHighlightClick = (e, activeHighlightDetails) => {
        if (this.primaryContainer) {
            this.primaryContainerRect = this.primaryContainer.getBoundingClientRect();
        }

        this.setState({
            showAssistant: true,
            activeHighlightRef: e.target,
            activeHighlightDetails,
        });
    }

    handleOnCloseAssistedActions = () => {
        this.setState({ showAssistant: false });
    }

    handleEntryAdd = (text) => {
        if (this.props.onEntryAdd) {
            this.props.onEntryAdd(text);
        }
        this.handleOnCloseAssistedActions();
    }

    handleLeadPreviewLoad = (leadPreview) => {
        if (this.nlpClassifyRequest) {
            this.nlpClassifyRequest.stop();
        }
        this.nlpClassifyRequest = this.createNlpClassifyRequest(leadPreview.classifiedDocId);
        this.nlpClassifyRequest.start();

        if (this.ceClassifyRequest) {
            this.ceClassifyRequest.stop();
        }
        this.ceClassifyRequest = this.createCeClassifyRequest(leadPreview.previewId);
        this.ceClassifyRequest.start();

        if (this.nerClassifyRequest) {
            this.nerClassifyRequest.stop();
        }
        this.nerClassifyRequest = this.createNerClassifyRequest(leadPreview.text);
        this.nerClassifyRequest.start();

        this.setState({ showAssistantOptions: true });
    }

    createNlpClassifyRequest = (docId) => {
        const request = new FgRestBuilder()
            .url(urlForLeadClassify)
            .params(() => createParamsForLeadClassify({
                deeper: 1,
                doc_id: docId,
            }))
            .preLoad(() => this.setState({ pendingNlpClassify: true }))
            .postLoad(() => this.setState({ pendingNlpClassify: false }))
            .success((response) => {
                // FIXME: write schema
                this.extractNlpClassifications(response);
            })
            .failure((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('components.assistedTagging', 'serverErrorText'),
                });
                */
            })
            .fatal((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('components.assistedTagging', 'connectionFailureText'),
                });
                */
            })
            .build();
        return request;
    }

    createNerClassifyRequest = (text) => {
        const request = new FgRestBuilder()
            .url(urlForNer)
            .params(() => createParamsForNer(text))
            .preLoad(() => this.setState({ pendingNerClassify: true }))
            .postLoad(() => this.setState({ pendingNerClassify: false }))
            .success((response) => {
                // FIXME: write schema
                this.extractNerClassifications(response);
            })
            .failure((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('components.assistedTagging', 'serverErrorText'),
                });
                */
            })
            .fatal((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('components.assistedTagging', 'connectionFailureText'),
                });
                */
            })
            .build();
        return request;
    }

    createCeClassifyRequest = (previewId) => {
        const request = new FgRestBuilder()
            .url(createUrlForCeClassify(this.props.projectId))
            .preLoad(() => this.setState({ pendingCeClassify: true }))
            .postLoad(() => this.setState({ pendingCeClassify: false }))
            .params(() => createParamsForCeClassify({
                previewId,
            }))
            .success((response) => {
                try {
                    schema.validate(response, 'categoryEditorClassifyList');
                    this.extractCeClassifications(response);
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('components.assistedTagging', 'serverErrorText'),
                });
                */
            })
            .fatal((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('components.assistedTagging', 'connectionFailureText'),
                });
                */
            })
            .build();
        return request;
    }

    createFeedbackRequest = (feedback) => {
        const request = new FgRestBuilder()
            .url(urlForFeedback)
            .params(() => createParamsForFeedback(feedback))
            .success(() => {
                try {
                    // console.warn('feedback sent', response);
                    notify.send({
                        title: _ts('components.assistedTagging', 'assitedTaggingFeedbackTitle'),
                        type: notify.type.SUCCESS,
                        message: _ts('components.assistedTagging', 'assitedTaggingFeedbackMessage'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('components.assistedTagging', 'serverErrorText'),
                });
                */
            })
            .fatal((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('components.assistedTagging', 'connectionFailureText'),
                });
                */
            })
            .build();
        return request;
    }

    extractNlpClassifications = (data) => {
        const { classification } = data;
        const nlpSectorOptions = classification.map(c => ({
            key: c[0],
            label: c[0],
        }));
        const nlpSelectedSectors = nlpSectorOptions.map(o => o.key);
        this.nlpClassifications = data.excerpts_classification.map(excerpt => ({
            start: excerpt.start_pos,
            end: excerpt.end_pos,
            label: excerpt.classification[0][0],
            sectors: [{
                label: excerpt.classification[0][0],
                confidence: `${Math.round(excerpt.classification_confidence * 100)}%`,
                confidence_value: excerpt.classification[0][1],
            }],
        })).filter(c => c.sectors.length > 0 && c.sectors[0].confidence_value > NLP_THRESHOLD);


        this.setState({
            nlpSectorOptions,
            nlpSelectedSectors,
        }, () => this.refreshSelections());
    }

    extractNerClassifications = (data) => {
        const nerSectorOptions = [];

        if (data.length < 1) {
            return;
        }

        data.forEach((d) => {
            if (nerSectorOptions.findIndex(o => o.key === d.entity) === -1) {
                nerSectorOptions.push({
                    key: d.entity,
                    label: d.entity.charAt(0) + d.entity.slice(1).toLowerCase(),
                });
            }
        });

        this.nerClassifications = data;

        this.setState({
            nerSectorOptions,
            nerSelectedSectors: nerSectorOptions.map(e => e.key),
        }, () => this.refreshSelections());
    }

    extractCeClassifications = (data) => {
        const { classifications } = data;
        const ceSectorOptions = classifications.map(c => ({
            key: c.title,
            label: c.title,
        }));

        const ceSelectedSectors = ceSectorOptions.map(c => c.key);
        this.ceClassifications = classifications;

        this.setState({
            ceSectorOptions,
            ceSelectedSectors,
        }, () => this.refreshSelections);
    }

    refreshSelections = () => {
        const {
            selectedAssitedTaggingSource,
        } = this.state;

        if (selectedAssitedTaggingSource === 'nlp') {
            this.refreshNlpClassifications();
        } else if (selectedAssitedTaggingSource === 'ce') {
            this.refreshCeClassifications();
        } else if (selectedAssitedTaggingSource === 'ner') {
            this.refreshNerClassifications();
        }
    }

    refreshNlpClassifications = () => {
        const { nlpSelectedSectors } = this.state;
        const { nlpClassifications } = this;

        if (!nlpClassifications) {
            this.setState({ highlights: emptyList });
            return;
        }

        const filteredClassifications = nlpClassifications.filter(excerpt => (
            nlpSelectedSectors.reduce((acc, sector) => acc ||
                excerpt.sectors.find(s => s.label === sector), false)
        ));

        const highlights = filteredClassifications.map(excerpt => ({
            ...excerpt,
            key: `${excerpt.start}`, // Assuming start position of each classification is unique
            color: getHexFromString(excerpt.sectors[0].label),
            source: _ts('components.assistedTagging', 'sourceNLP'),
        }));
        this.setState({ highlights });
    }

    refreshNerClassifications = () => {
        const { nerSelectedSectors } = this.state;
        const { nerClassifications } = this;

        if (!nerClassifications) {
            this.setState({ highlights: emptyList });
            return;
        }

        const keywords = nerClassifications.filter(c => (
            nerSelectedSectors.find(t => t === c.entity)
        )).reduce((acc, c) => acc.concat(c), []);

        const highlights = keywords.map(keyword => ({
            key: `${keyword.start}`, // Assuming start position of each classification is unique
            start: keyword.start,
            end: keyword.length + keyword.start,
            label: keyword.entity,
            color: getHexFromString(keyword.entity),
            source: _ts('components.assistedTagging', 'sourceNER'),
            details: keyword.entity,
        }));
        this.setState({ highlights });
    }

    refreshCeClassifications = () => {
        const { ceSelectedSectors } = this.state;
        const { ceClassifications } = this;

        if (!ceClassifications) {
            this.setState({ highlights: emptyList });
            return;
        }

        const keywords = ceClassifications.filter(c => (
            ceSelectedSectors.find(t => t === c.title)
        )).reduce((acc, c) => acc.concat(c.keywords), []);

        const highlights = keywords.map(keyword => ({
            key: `${keyword.start}`, // Assuming start position of each classification is unique
            start: keyword.start,
            end: keyword.start + keyword.length,
            label: keyword.subcategory,
            color: getHexFromString(keyword.subcategory),
            source: _ts('components.assistedTagging', 'sourceCE'),
            details: keyword.subcategory,
        }));
        this.setState({ highlights });
    }

    handleNerSectorSelect = (nerSelectedSectors) => {
        this.setState({ nerSelectedSectors }, () => {
            this.refreshSelections();
        });
    }

    handleCeSectorSelect = (ceSelectedSectors) => {
        this.setState({ ceSelectedSectors }, () => {
            this.refreshSelections();
        });
    }

    handleNlpSectorSelect = (nlpSelectedSectors) => {
        this.setState({ nlpSelectedSectors }, () => {
            this.refreshSelections();
        });
    }

    handleFeedbackClick = (classificationLabel, useful) => {
        const { activeHighlightDetails } = this.state;
        const feedback = {
            text: activeHighlightDetails.text,
            classification_label: classificationLabel,
            useful,
        };

        if (this.feedbackRequest) {
            this.feedbackRequest.stop();
        }
        this.feedbackRequest = this.createFeedbackRequest(feedback);
        this.feedbackRequest.start();
    }

    calcSectorKey = d => d.label;

    renderSectorList = (key, sector) => (
        <div
            key={sector.label}
            className={styles.sector}
        >
            <div className={styles.sectorText}>
                {sector.label} {sector.confidence}
            </div>
            <div className={styles.feedbackButtons}>
                <SuccessButton
                    title={_ts('components.assistedTagging', 'accurateTextTitle')}
                    onClick={() => this.handleFeedbackClick(sector.label, 'true')}
                    transparent
                >
                    <span className={iconNames.thumbsUp} />
                </SuccessButton>
                <WarningButton
                    title={_ts('components.assistedTagging', 'notAccurateTextTitle')}
                    onClick={() => this.handleFeedbackClick(sector.label, 'false')}
                    transparent
                >
                    <span className={iconNames.thumbsDown} />
                </WarningButton>
            </div>
        </div>
    );

    renderAssistant = () => {
        const { onEntryAdd } = this.props;

        const {
            activeHighlightDetails,
            showAssistant,
            selectedAssitedTaggingSource,
        } = this.state;

        if (!showAssistant) {
            return null;
        }

        return (
            <FloatingContainer
                parent={this.state.activeHighlightRef}
                onInvalidate={this.handleAssitedBoxInvalidate}
            >
                <div className={styles.assistant}>
                    <header className={styles.header}>
                        <div className={styles.title}>
                            <span className={styles.label}>
                                {_ts('components.assistedTagging', 'sourceText')}
                            </span>
                            <span className={styles.source}>
                                {activeHighlightDetails.source}
                            </span>
                        </div>
                        <PrimaryButton
                            onClick={this.handleOnCloseAssistedActions}
                            transparent
                        >
                            <span className={iconNames.close} />
                        </PrimaryButton>
                    </header>
                    <div className={styles.infoBar}>
                        <span>
                            {activeHighlightDetails.text}
                        </span>
                        <div>
                            { activeHighlightDetails.details && (
                                <span className={styles.details}>
                                    {activeHighlightDetails.details.toLowerCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    {selectedAssitedTaggingSource === 'nlp' && (
                        <ListView
                            className={styles.sectors}
                            modifier={this.renderSectorList}
                            data={activeHighlightDetails.sectors}
                            keyExtractor={this.calcSectorKey}
                        />
                    )}
                    {onEntryAdd && (
                        <PrimaryButton
                            iconName={iconNames.add}
                            className={styles.addButton}
                            onClick={() => this.handleEntryAdd(
                                activeHighlightDetails.text,
                            )}
                        >
                            {_ts('components.assistedTagging', 'addEntryButtonLabel')}
                        </PrimaryButton>
                    )}
                </div>
            </FloatingContainer>
        );
    }

    renderAssistantOptions = () => {
        const {
            showAssistantOptions,
            nlpSectorOptions,
            nlpSelectedSectors,
            ceSectorOptions,
            ceSelectedSectors,
            nerSectorOptions,
            nerSelectedSectors,
            selectedAssitedTaggingSource,
        } = this.state;

        if (!showAssistantOptions) {
            return false;
        }

        const NLP = 'nlp';
        const CATEGORY_EDITOR = 'ce';
        const NER = 'ner';

        return (
            <div className={`assistant-options ${styles.assistantOptions}`}>
                <SegmentButton
                    className={styles.assistedSourceChangeBtn}
                    data={this.assitedTaggingSources}
                    selected={selectedAssitedTaggingSource}
                    onChange={this.handleAssitedTaggingSourceChange}
                    backgroundHighlight
                />
                { selectedAssitedTaggingSource === NLP && (
                    <MultiSelectInput
                        disabled={this.state.pendingNlpClassify}
                        label={_ts('components.assistedTagging', 'showSuggestionText')}
                        className={styles.selectInput}
                        options={nlpSectorOptions}
                        showHintAndError={false}
                        value={nlpSelectedSectors}
                        onChange={this.handleNlpSectorSelect}
                    />
                )}
                { selectedAssitedTaggingSource === CATEGORY_EDITOR && (
                    <MultiSelectInput
                        disabled={this.state.pendingCeClassify}
                        label={_ts('components.assistedTagging', 'showSuggestionText')}
                        className={styles.selectInput}
                        options={ceSectorOptions}
                        showHintAndError={false}
                        value={ceSelectedSectors}
                        onChange={this.handleCeSectorSelect}
                    />
                )}
                { selectedAssitedTaggingSource === NER && (
                    <MultiSelectInput
                        disabled={this.state.pendingNerClassify}
                        label={_ts('components.assistedTagging', 'showSuggestionText')}
                        className={styles.selectInput}
                        options={nerSectorOptions}
                        showHintAndError={false}
                        value={nerSelectedSectors}
                        onChange={this.handleNerSectorSelect}
                    />
                )}
            </div>
        );
    }

    render() {
        const { leadId } = this.props;
        const { highlights } = this.state;

        const Assistant = this.renderAssistant;
        const AssistantOptions = this.renderAssistantOptions;

        const className = this.getClassName();
        const previewClassName = `
            'preview'
            ${styles.preview}
        `;

        return (
            <div
                ref={(el) => { this.primaryContainer = el; }}
                className={className}
            >
                <SimplifiedLeadPreview
                    className={previewClassName}
                    leadId={leadId}
                    highlights={highlights}
                    onLoad={this.handleLeadPreviewLoad}
                    renderer={Highlight}
                    rendererParams={this.highlightRendererParams}
                />
                <AssistantOptions />
                <div className={styles.info}>
                    <span
                        className={`${styles.icon} ${iconNames.help}`}
                        title={_ts('components.assistedTagging', 'infoTooltip')}
                    />
                </div>
                <Assistant />
            </div>
        );
    }
}
