import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FaramList, FaramGroup } from '@togglecorp/faram';
import { randomString } from '@togglecorp/fujs';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import FormattedTextArea from '#rsci/FormattedTextArea';
import List from '#rscv/List';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ResizableV from '#rscv/Resizable/ResizableV';

import _ts from '#ts';
import {
    aryTemplateMethodologySelector,
    assessmentSourcesSelector,

    isSecondaryDataReviewSelected,
} from '#redux';

import Row from './Row';
import Header from '../Header';

import styles from './styles.scss';

const ColumnHeader = ({ title }) => (
    <div className={styles.title}>
        {title}
    </div>
);
ColumnHeader.propTypes = {
    title: PropTypes.string.isRequired,
};

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

    static addAttribute = attributes => ([
        ...attributes,
        {
            key: randomString(16),
        },
    ])

    headerKeySelector = methodologyGroup => methodologyGroup.id;

    headerRendererParams = (k, methodologyGroup) => ({
        title: methodologyGroup.title,
    })

    rowRendererParams = (k, attribute, index) => ({
        attributesTemplate: this.props.aryTemplateMethodology,
        index,
        secondaryDataReviewSelected: isSecondaryDataReviewSelected(attribute),
        sources: this.props.sources,
    })

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

        return (
            <div className={styles.methodology}>
                {pending && <LoadingAnimation />}
                <FaramGroup faramElementName="methodology">
                    <ResizableV
                        className={styles.top}
                        topContainerClassName={styles.top}
                        bottomContainerClassName={styles.bottom}
                        topChild={
                            <div className={styles.methodologyContent}>
                                <Header
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
                                                    data={attributesTemplate}
                                                    renderer={ColumnHeader}
                                                    keySelector={this.headerKeySelector}
                                                    rendererParams={this.headerRendererParams}
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
                                                renderer={Row}
                                                keySelector={Methodology.keySelector}
                                                rendererParams={this.rowRendererParams}
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
