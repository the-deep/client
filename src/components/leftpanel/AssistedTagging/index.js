import PropTypes from 'prop-types';
import React from 'react';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import WarningButton from '#rsca/Button/WarningButton';
import SegmentInput from '#rsci/SegmentInput';
import MultiSelectInput from '#rsci/MultiSelectInput';
import FloatingContainer from '#rscv/FloatingContainer';
import ListView from '#rscv/List/ListView';
import { getHexFromString, listToMap } from '#rsu/common';
import { FgRestBuilder } from '#rsu/rest';

import { iconNames } from '#constants';
import _cs from '#cs';
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
const NLP_THRESHOLD = 0.70;
const NLP = 'nlp';
const CATEGORY_EDITOR = 'ce';
const NER = 'ner';


export default class AssistedTagging extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static sourceKeySelector = d => d.value;
    static sourceLabelSelector = d => d.label;

    static calcSectorKey = d => d.label;

    static highlightsTransformer = d => (
        d.filter(h => h.start >= 0).sort((a, b) => a.start - b.start)
    );

    static assitedTaggingSources = [
        {
            label: _ts('components.assistedTagging', 'nlpLabel'),
            value: NLP,
        },
        {
            label: _ts('components.assistedTagging', 'entitiesLabel'),
            value: NER,
        },
        {
            label: _ts('components.assistedTagging', 'ceLabel'),
            value: CATEGORY_EDITOR,
        },
    ];

    constructor(props) {
        super(props);

        this.state = {
            showAssistant: false,
            showAssistantOptions: false,

            activeHighlightRef: undefined,
            activeHighlightDetails: emptyObject,

            selectedAssitedTaggingSource: NLP,
            ceHighlights: [],
            nerHighlights: [],
            nlpHighlights: [],

            nlpSectorOptions: emptyList,
            nlpSelectedSectors: emptyList,
            pendingNlpClassify: true,

            ceSectorOptions: emptyList,
            ceSelectedSectors: emptyList,
            pendingCeClassify: true,

            nerSectorOptions: emptyList,
            nerSelectedSectors: emptyList,
            pendingNerClassify: true,
        };

        this.nlpClassifications = undefined;
        this.ceClassifications = undefined;
        this.nerClassifications = undefined;

        this.primaryContainerRect = undefined;
    }

    // TODO: cancel requests and call a new if projectId has changed

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

    handleAssitedBoxInvalidate = (popupContainer) => {
        const primaryContainerRect = this.primaryContainerRect || (
            this.primaryContainer && this.primaryContainer.getBoundingClientRect()
        );
        if (!primaryContainerRect) {
            return null;
        }

        const popupRect = popupContainer.getBoundingClientRect();
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
        });
    }

    handleNerSectorSelect = (nerSelectedSectors) => {
        this.setState({
            nerSelectedSectors,
            nerHighlights: this.calculateNerHighlights(nerSelectedSectors, this.nerClassifications),
        });
    }

    handleCeSectorSelect = (ceSelectedSectors) => {
        this.setState({
            ceSelectedSectors,
            ceHighlights: this.calculateCeHighlights(ceSelectedSectors, this.ceClassifications),
        });
    }

    handleNlpSectorSelect = (nlpSelectedSectors) => {
        this.setState({
            nlpSelectedSectors,
            nlpHighlights: this.calculateNlpHighlights(nlpSelectedSectors, this.nlpClassifications),
        });
    }

    handleHighlightClick = (e, { text, highlight }) => {
        if (this.primaryContainer) {
            this.primaryContainerRect = this.primaryContainer.getBoundingClientRect();
        }

        this.setState({
            showAssistant: true,
            activeHighlightRef: e.target,
            activeHighlightDetails: {
                ...highlight,
                text,
            },
        });
    }

    handleEntryAdd = (text) => {
        if (this.props.onEntryAdd) {
            this.props.onEntryAdd(text);
        }
        this.handleOnCloseAssistedActions();
    }

    handleOnCloseAssistedActions = () => {
        this.setState({ showAssistant: false });
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
            .build();
        return request;
    }

    extractNlpClassifications = (data) => {
        const { classification } = data;

        const nlpClassifications = data.excerpts_classification
            .map(excerpt => ({
                start: excerpt.start_pos,
                end: excerpt.end_pos,
                label: excerpt.classification[0][0],
                sectors: [{
                    label: excerpt.classification[0][0],
                    confidence: `${Math.round(excerpt.classification_confidence * 100)}%`,
                    confidence_value: excerpt.classification[0][1],
                }],
            })).filter(c => (
                c.sectors.length > 0 && c.sectors[0].confidence_value > NLP_THRESHOLD
            ));

        // Mapping of sectors that are identified
        const identifiedOptions = listToMap(
            nlpClassifications,
            item => item.sectors[0].label,
            () => true,
        );

        const nlpSectorOptions = classification.map(c => ({
            key: c[0],
            label: c[0],
        })).filter(item => identifiedOptions[item.key]);
        const nlpSelectedSectors = nlpSectorOptions.map(o => o.key);

        // NOTE: for memory
        this.nlpClassifications = nlpClassifications;

        this.setState({
            nlpSectorOptions,
            nlpSelectedSectors,
            nlpHighlights: this.calculateNlpHighlights(nlpSelectedSectors, nlpClassifications),
        });
    }

    extractNerClassifications = (data) => {
        if (data.length < 1) {
            return;
        }

        const nerSectorOptions = [];
        // NOTE: use unique
        data.forEach((d) => {
            if (nerSectorOptions.findIndex(o => o.key === d.entity) === -1) {
                nerSectorOptions.push({
                    key: d.entity,
                    label: d.entity.charAt(0) + d.entity.slice(1).toLowerCase(),
                });
            }
        });

        // NOTE: for memory
        this.nerClassifications = data;

        const nerSelectedSectors = nerSectorOptions.map(e => e.key);
        this.setState({
            nerSectorOptions,
            nerSelectedSectors,
            nerHighlights: this.calculateNerHighlights(nerSelectedSectors, data),
        });
    }

    extractCeClassifications = (data) => {
        const { classifications } = data;
        const ceSectorOptions = classifications.map(c => ({
            key: c.title,
            label: c.title,
        }));

        const ceSelectedSectors = ceSectorOptions.map(c => c.key);

        // NOTE: for memory
        this.ceClassifications = classifications;

        this.setState({
            ceSectorOptions,
            ceSelectedSectors,
            ceHighlights: this.calculateCeHighlights(ceSelectedSectors, classifications),
        });
    }

    calculateNlpHighlights = (nlpSelectedSectors, nlpClassifications) => {
        if (!nlpClassifications) {
            return emptyList;
        }

        const filteredClassifications = nlpClassifications.filter(excerpt => (
            nlpSelectedSectors.reduce((acc, sector) => acc ||
                excerpt.sectors.find(s => s.label === sector), false)
        ));

        const highlights = filteredClassifications.map(({ start, end, label, ...otherProps }) => ({
            key: `${start}`, // Assuming start position of each classification is unique
            start,
            end,
            label,
            color: getHexFromString(label),
            source: _ts('components.assistedTagging', 'sourceNLP'),
            ...otherProps,
        }));

        return highlights;
    }

    calculateNerHighlights = (nerSelectedSectors, nerClassifications) => {
        if (!nerClassifications) {
            return emptyList;
        }

        const keywords = nerClassifications.filter(
            c => nerSelectedSectors.find(t => t === c.entity),
        ).reduce(
            (acc, c) => acc.concat(c),
            [],
        );

        const highlights = keywords.map(keyword => ({
            key: `${keyword.start}`, // Assuming start position of each classification is unique
            start: keyword.start,
            end: keyword.length + keyword.start,
            label: keyword.entity,
            color: getHexFromString(keyword.entity),
            source: _ts('components.assistedTagging', 'sourceNER'),
            details: keyword.entity,
        }));

        return highlights;
    }

    calculateCeHighlights = (ceSelectedSectors, ceClassifications) => {
        if (!ceClassifications) {
            return emptyList;
        }

        const keywords = ceClassifications.filter(
            c => ceSelectedSectors.find(t => t === c.title),
        ).reduce(
            (acc, c) => acc.concat(c.keywords),
            [],
        );

        const highlights = keywords.map(keyword => ({
            key: `${keyword.start}`, // Assuming start position of each classification is unique
            start: keyword.start,
            end: keyword.start + keyword.length,
            label: keyword.subcategory,
            color: getHexFromString(keyword.subcategory),
            source: _ts('components.assistedTagging', 'sourceCE'),
            details: keyword.subcategory,
        }));
        return highlights;
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
            activeHighlightRef,
        } = this.state;

        if (!showAssistant) {
            return null;
        }

        return (
            <FloatingContainer
                parent={activeHighlightRef}
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
                    {selectedAssitedTaggingSource === NLP && (
                        <ListView
                            className={styles.sectors}
                            modifier={this.renderSectorList}
                            data={activeHighlightDetails.sectors}
                            keySelector={AssistedTagging.calcSectorKey}
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
            return null;
        }

        return (
            <div className={`assistant-options ${styles.assistantOptions}`}>
                <SegmentInput
                    className={styles.assistedSourceChangeBtn}
                    options={AssistedTagging.assitedTaggingSources}
                    label={_ts('components.assistedTagging', 'sourceSelectionLabel')}
                    value={selectedAssitedTaggingSource}
                    name="source-selection"
                    onChange={this.handleAssitedTaggingSourceChange}
                    keySelector={AssistedTagging.sourceKeySelector}
                    labelSelector={AssistedTagging.sourceLabelSelector}
                    showHintAndError={false}
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
        const { leadId, className: classNameFromProps } = this.props;
        const {
            selectedAssitedTaggingSource,
            nerHighlights,
            ceHighlights,
            nlpHighlights,
            showAssistant,
            showAssistantOptions,
        } = this.state;

        const highlights = (selectedAssitedTaggingSource === NLP && nlpHighlights) ||
            (selectedAssitedTaggingSource === NER && nerHighlights) ||
            (selectedAssitedTaggingSource === CATEGORY_EDITOR && ceHighlights) ||
            emptyList;

        const Assistant = this.renderAssistant;
        const AssistantOptions = this.renderAssistantOptions;

        const className = _cs(
            classNameFromProps,
            styles.assistedTagging,
            'assited-tagging',
            showAssistant && styles.assistantShown,
            showAssistant && 'assistant-shown',
            showAssistantOptions && styles.assistantOptionsShown,
            showAssistantOptions && 'assistant-option-shown',
        );

        const previewClassName = _cs(
            'preview',
            styles.preview,
        );

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
                    onClick={this.handleHighlightClick}
                    highlightsTransformer={AssistedTagging.highlightsTransformer}
                />
                <AssistantOptions />
                <Assistant />
            </div>
        );
    }
}
