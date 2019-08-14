import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FaramList, FaramGroup } from '@togglecorp/faram';
import { randomString } from '@togglecorp/fujs';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import FormattedTextArea from '#rsci/FormattedTextArea';
import List from '#rscv/List';
import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ResizableV from '#rscv/Resizable/ResizableV';

import _ts from '#ts';
import {
    aryTemplateMethodologySelector,
    assessmentSourcesSelector,

    isDataCollectionTechniqueColumn,
    isSecondaryDataReviewSelected,
} from '#redux';

import Header from '../Header';
import { renderWidget } from '../widgetUtils';

import styles from './styles.scss';

const propTypes = {
    aryTemplateMethodology: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    sources: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
};

const defaultProps = {
    aryTemplateMethodology: [],
    pending: false,
};

const mapStateToProps = state => ({
    aryTemplateMethodology: aryTemplateMethodologySelector(state),
    sources: assessmentSourcesSelector(state),
});

@connect(mapStateToProps)
export default class Methodology extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = d => d.key;

    static removeAttribute = (attributes, index) => {
        const newAttributes = [...attributes];
        newAttributes.splice(index, 1);
        return newAttributes;
    }

    static addAttribute = attributes => ([
        ...attributes,
        {
            key: randomString(16),
        },
    ])

    renderAttributeHeader = (k, key) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;
        const methodologyGroup = attributesTemplate[key];

        return (
            <div
                className={styles.title}
                key={methodologyGroup.id}
            >
                {methodologyGroup.title}
            </div>
        );
    };

    renderAttribute = (key, index, secondaryDataReviewSelected) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;
        const methodologyGroup = attributesTemplate[key];

        const renderCustomWidget = (k, data) => {
            const hide = !isDataCollectionTechniqueColumn(data) && secondaryDataReviewSelected;
            if (hide) {
                return null;
            }

            return renderWidget(k, data, this.props.sources);
        };

        return (
            <FaramGroup
                key={key}
                faramElementName={String(index)}
            >
                <ListView
                    className={styles.cell}
                    data={methodologyGroup.fields}
                    modifier={renderCustomWidget}
                />
            </FaramGroup>
        );
    }

    renderAttributeRow = (rowKey, attribute, index) => {
        // FIXME: memoize this
        const { aryTemplateMethodology: attributesTemplate } = this.props;

        const secondaryDataReviewSelected = isSecondaryDataReviewSelected(attribute);

        const renderAttribute = (k, key) => this.renderAttribute(
            key,
            index,
            secondaryDataReviewSelected,
        );

        const attributesTemplateKeys = Object.keys(attributesTemplate);

        return (
            <div
                key={rowKey}
                className={styles.row}
            >
                <List
                    data={attributesTemplateKeys}
                    modifier={renderAttribute}
                />
                <div className={styles.actionButtons}>
                    <DangerButton
                        iconName="delete"
                        faramElementName={index}
                        faramAction={Methodology.removeAttribute}
                    />
                </div>
            </div>
        );
    }

    render() {
        const {
            aryTemplateMethodology: attributesTemplate,
            pending,
        } = this.props;

        const methodologyContentTitle = _ts('editAssessment.methodology', 'methodologyContentTitle');

        const objectivesTitle = _ts('editAssessment.methodology', 'objectivesTitle');
        const dataCollectionTechniquesTitle = _ts('editAssessment.methodology', 'dataCollectionTechniquesTitle');
        const samplingTitle = _ts('editAssessment.methodology', 'samplingTitle');
        const limitationsTitle = _ts('editAssessment.methodology', 'limitationsTitle');

        const objectivesPlaceholder = _ts('editAssessment.methodology', 'objectivesPlaceholder');
        const dataCollectionTechniquesPlaceholder = _ts('editAssessment.methodology', 'dataCollectionTechniquesPlaceholder');
        const samplingPlaceholder = _ts('editAssessment.methodology', 'samplingPlaceholder');
        const limitationsPlaceholder = _ts('editAssessment.methodology', 'limitationsPlaceholder');

        // FIXME: memoize this
        const attributesTemplateKeys = Object.keys(attributesTemplate);

        return (
            <div className={styles.methodology}>
                {pending && <LoadingAnimation />}
                <FaramGroup faramElementName="methodology">
                    <ResizableV
                        className={styles.top}
                        topContainerClassName={styles.toptop}
                        bottomContainerClassName={styles.topbottom}
                        topChild={
                            <div className={styles.methodologyContent}>
                                <Header
                                    className={styles.header}
                                    title={methodologyContentTitle}
                                />
                                <div className={styles.content}>
                                    <FormattedTextArea
                                        faramElementName="objectives"
                                        className={styles.input}
                                        placeholder={objectivesPlaceholder}
                                        label={objectivesTitle}
                                    />
                                    <FormattedTextArea
                                        faramElementName="dataCollectionTechniques"
                                        className={styles.input}
                                        placeholder={dataCollectionTechniquesPlaceholder}
                                        label={dataCollectionTechniquesTitle}
                                    />
                                    <FormattedTextArea
                                        faramElementName="sampling"
                                        className={styles.input}
                                        placeholder={samplingPlaceholder}
                                        label={samplingTitle}
                                    />
                                    <FormattedTextArea
                                        faramElementName="limitations"
                                        className={styles.input}
                                        placeholder={limitationsPlaceholder}
                                        label={limitationsTitle}
                                    />
                                </div>
                            </div>
                        }
                        bottomChild={
                            <FaramList
                                faramElementName="attributes"
                                keySelector={Methodology.keySelector}
                            >
                                <div className={styles.attributesSection}>
                                    <Header className={styles.header} />
                                    <div className={styles.scrollWrap}>
                                        <div className={styles.attributes}>
                                            <div className={styles.header}>
                                                <List
                                                    data={attributesTemplateKeys}
                                                    modifier={this.renderAttributeHeader}
                                                />
                                                <div className={styles.actionButtons}>
                                                    <PrimaryButton
                                                        faramElementName="add-button"
                                                        faramAction={Methodology.addAttribute}
                                                        iconName="add"
                                                    />
                                                </div>
                                            </div>
                                            <List
                                                faramElement
                                                modifier={this.renderAttributeRow}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </FaramList>
                        }
                    />
                </FaramGroup>
            </div>
        );
    }
}
