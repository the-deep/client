import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FaramList, FaramGroup } from '@togglecorp/faram';

import ResizableV from '#rscv/Resizable/ResizableV';
import LoadingAnimation from '#rscv/LoadingAnimation';
import List from '#rscv/List';
import ListView from '#rscv/List/ListView';
import FormattedTextArea from '#rsci/FormattedTextArea';
import ListSelection from '#rsci/ListSelection';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';
import { randomString } from '@togglecorp/fujs';

import _ts from '#ts';
import {
    aryTemplateMethodologySelector,
    assessmentSectorsSelector,
    assessmentSourcesSelector,
    focusesSelector,
    affectedGroupsSelector,

    projectDetailsSelector,
    geoOptionsForProjectSelector,

    isSecondaryDataReviewOption,
    isDataCollectionTechniqueColumn,
    getDataCollectionTechnique,
} from '#redux';
import OrganigramInput from '#components/input/OrganigramInput/';
import GeoInput from '#components/input/GeoInput/';

import Header from '../Header';
import { renderWidget } from '../widgetUtils';

import styles from './styles.scss';

const propTypes = {
    affectedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    aryTemplateMethodology: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    focuses: PropTypes.arrayOf(PropTypes.object).isRequired,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    sectors: PropTypes.arrayOf(PropTypes.object).isRequired,
    sources: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
    aryTemplateMethodology: [],
    geoOptions: {},
};

const mapStateToProps = state => ({
    affectedGroups: affectedGroupsSelector(state),
    aryTemplateMethodology: aryTemplateMethodologySelector(state),
    focuses: focusesSelector(state),
    geoOptions: geoOptionsForProjectSelector(state),
    projectDetails: projectDetailsSelector(state),
    sectors: assessmentSectorsSelector(state),
    sources: assessmentSourcesSelector(state),
});

const idSelector = d => String(d.id);
const titleSelector = d => d.title;

@connect(mapStateToProps)
export default class Methodology extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static orgIdSelector = organ => organ.id;
    static orgLabelSelector = organ => organ.title;
    static orgChildSelector = organ => organ.children;

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

    renderAttribute = (key, index, isSecondaryDataReviewSelected) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;
        const methodologyGroup = attributesTemplate[key];

        const renderCustomWidget = (k, data) => {
            const hide = !isDataCollectionTechniqueColumn(data) && isSecondaryDataReviewSelected;
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

        const dataCollectionTechnique = getDataCollectionTechnique(attributesTemplate);
        const secondaryDataReview = dataCollectionTechnique.options.find(
            isSecondaryDataReviewOption,
        );
        const isSecondaryDataReviewSelected = (
            attribute[dataCollectionTechnique.id] === secondaryDataReview.key
        );

        const renderAttribute = (k, key) => this.renderAttribute(
            key,
            index,
            isSecondaryDataReviewSelected,
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
            sectors,
            focuses,
            affectedGroups,
            projectDetails,
            geoOptions,
            pending,
        } = this.props;

        const focusesTitle = _ts('editAssessment.methodology', 'focusesTitle');
        const sectorsTitle = _ts('editAssessment.methodology', 'sectorsTitle');
        const affectedGroupsTitle = _ts('editAssessment.methodology', 'affectedGroupsTitle');
        const locationsTitle = _ts('editAssessment.methodology', 'locationsTitle');
        const methodologyContentTitle = _ts('editAssessment.methodology', 'methodologyContentTitle');

        const objectivesTitle = _ts('editAssessment.methodology', 'objectivesTitle');
        const dataCollectionTechniquesTitle = _ts('editAssessment.methodology', 'dataCollectionTechniquesTitle');
        const samplingTitle = _ts('editAssessment.methodology', 'samplingTitle');
        const limitationsTitle = _ts('editAssessment.methodology', 'limitationsTitle');

        const objectivesPlaceholder = _ts('editAssessment.methodology', 'objectivesPlaceholder');
        const dataCollectionTechniquesPlaceholder = _ts('editAssessment.methodology', 'dataCollectionTechniquesPlaceholder');
        const samplingPlaceholder = _ts('editAssessment.methodology', 'samplingPlaceholder');
        const limitationsPlaceholder = _ts('editAssessment.methodology', 'limitationsPlaceholder');

        const attributesTemplateKeys = Object.keys(attributesTemplate);

        return (
            <div className={styles.methodology}>
                <FaramGroup faramElementName="methodology">
                    {pending && <LoadingAnimation />}

                    <ResizableV
                        className={styles.resizable}
                        topContainerClassName={styles.top}
                        bottomContainerClassName={styles.bottom}
                        topChild={
                            <ResizableV
                                className={styles.top}
                                topContainerClassName={styles.toptop}
                                bottomContainerClassName={styles.topbottom}
                                topChild={
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
                                                                faramAction={
                                                                    Methodology.addAttribute
                                                                }
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
                                bottomChild={
                                    <section className={styles.middleSection}>
                                        <div className={styles.middleSectionItem}>
                                            <Header
                                                className={styles.header}
                                                title={focusesTitle}
                                            />
                                            <ListSelection
                                                className={styles.focuses}
                                                faramElementName="focuses"
                                                options={focuses}
                                                keySelector={idSelector}
                                                labelSelector={titleSelector}
                                            />
                                        </div>
                                        <div className={styles.middleSectionItem}>
                                            <Header
                                                className={styles.header}
                                                title={sectorsTitle}
                                            />
                                            <ListSelection
                                                faramElementName="sectors"
                                                options={sectors}
                                                className={styles.sectors}
                                                keySelector={idSelector}
                                                labelSelector={titleSelector}
                                            />
                                        </div>
                                        <div className={styles.affectedGroups}>
                                            <Header
                                                className={styles.header}
                                                title={affectedGroupsTitle}
                                            />
                                            <OrganigramInput
                                                faramElementName="affectedGroups"
                                                data={affectedGroups}
                                                childSelector={Methodology.orgChildSelector}
                                                labelSelector={Methodology.orgLabelSelector}
                                                idSelector={Methodology.orgIdSelector}
                                            />
                                        </div>
                                        <div className={styles.locationSelection}>
                                            <Header
                                                className={styles.header}
                                                title={locationsTitle}
                                            />
                                            <GeoInput
                                                faramElementName="locations"
                                                title={locationsTitle}
                                                geoOptionsByRegion={geoOptions}
                                                regions={projectDetails.regions}
                                            />
                                        </div>
                                    </section>
                                }
                            />
                        }
                        bottomChild={
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
                    />
                </FaramGroup>
            </div>
        );
    }
}
