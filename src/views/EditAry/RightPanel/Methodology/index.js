import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '#rscg/FaramGroup';
import FaramList from '#rscg/FaramList';
import LoadingAnimation from '#rscv/LoadingAnimation';
import List from '#rscv/List';
import ListView from '#rscv/List/ListView';
import FormattedTextArea from '#rsci/FormattedTextArea';
import ListSelection from '#rsci/ListSelection';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';
import { randomString } from '#rsu/common';

import _ts from '#ts';
import { iconNames } from '#constants';
import {
    aryTemplateMethodologySelector,
    assessmentSectorsSelector,
    focusesSelector,
    affectedGroupsSelector,

    projectDetailsSelector,
    geoOptionsForProjectSelector,
} from '#redux';
import OrganigramInput from '#components/OrganigramInput/';
import GeoInput from '#components/GeoInput/';

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

    renderAttribute = (key, index) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;
        const methodologyGroup = attributesTemplate[key];

        return (
            <FaramGroup
                key={key}
                faramElementName={String(index)}
            >
                <ListView
                    className={styles.cell}
                    data={methodologyGroup.fields}
                    modifier={renderWidget}
                />
            </FaramGroup>
        );
    }

    renderAttributeRow = (rowKey, attribute, index) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;
        const attributesTemplateKeys = Object.keys(attributesTemplate);
        const renderAttribute = (k, key) => this.renderAttribute(key, index);

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
                        iconName={iconNames.delete}
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
        const attributesTitle = _ts('editAssessment.methodology', 'attributesTitle');

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

                    <FaramList
                        faramElementName="attributes"
                        keySelector={Methodology.keySelector}
                    >
                        <div className={styles.attributesSection}>
                            <Header
                                className={styles.header}
                                title={attributesTitle}
                            />
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
                                                iconName={iconNames.add}
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

                    <section className={styles.middleSection}>
                        <div className={styles.middleSectionItem}>
                            <div className={styles.title}>
                                {focusesTitle}
                            </div>
                            <ListSelection
                                className={styles.focuses}
                                faramElementName="focuses"
                                options={focuses}
                                keySelector={idSelector}
                                labelSelector={titleSelector}
                            />
                        </div>
                        <div className={styles.middleSectionItem}>
                            <div className={styles.title}>
                                {sectorsTitle}
                            </div>
                            <ListSelection
                                faramElementName="sectors"
                                options={sectors}
                                className={styles.sectors}
                                keySelector={idSelector}
                                labelSelector={titleSelector}
                            />
                        </div>
                        <div className={styles.affectedGroups}>
                            <div className={styles.title}>
                                {affectedGroupsTitle}
                            </div>
                            <OrganigramInput
                                faramElementName="affectedGroups"
                                data={affectedGroups}
                                childSelector={Methodology.orgChildSelector}
                                labelSelector={Methodology.orgLabelSelector}
                                idSelector={Methodology.orgIdSelector}
                            />
                        </div>
                        <div className={styles.locationSelection}>
                            <div className={styles.title}>
                                {locationsTitle}
                            </div>
                            <GeoInput
                                faramElementName="locations"
                                title={locationsTitle}
                                geoOptionsByRegion={geoOptions}
                                regions={projectDetails.regions}
                            />
                        </div>
                    </section>

                    <div className={styles.methodologyContent}>
                        <Header
                            className={styles.header}
                            title={methodologyContentTitle}
                        />
                        <div className={styles.content}>
                            <FormattedTextArea
                                faramElementName="objectives"
                                className={styles.farea}
                                placeholder={objectivesPlaceholder}
                                label={objectivesTitle}
                            />
                            <FormattedTextArea
                                faramElementName="dataCollectionTechniques"
                                className={styles.farea}
                                placeholder={dataCollectionTechniquesPlaceholder}
                                label={dataCollectionTechniquesTitle}
                            />
                            <FormattedTextArea
                                faramElementName="sampling"
                                className={styles.farea}
                                placeholder={samplingPlaceholder}
                                label={samplingTitle}
                            />
                            <FormattedTextArea
                                faramElementName="limitations"
                                className={styles.farea}
                                placeholder={limitationsPlaceholder}
                                label={limitationsTitle}
                            />
                        </div>
                    </div>
                </FaramGroup>
            </div>
        );
    }
}
