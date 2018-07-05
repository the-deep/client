import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '#rs/components/Input/Faram/FaramGroup';
import FaramList from '#rs/components/Input/Faram/FaramList';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import List from '#rs/components/View/List';
import ListView from '#rs/components/View/List/ListView';
import TextArea from '#rs/components/Input/TextArea';
import CheckGroup from '#rs/components/Input/CheckGroup';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import DangerButton from '#rs/components/Action/Button/DangerButton';

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
import OrganigramWithList from '#components/OrganigramWithList/';
import GeoListInput from '#components/GeoListInput/';

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
    className: '',
    aryTemplateMethodology: [],
    geoOptions: {},
};

const mapStateToProps = (state, props) => ({
    affectedGroups: affectedGroupsSelector(state),
    aryTemplateMethodology: aryTemplateMethodologySelector(state),
    focuses: focusesSelector(state),
    geoOptions: geoOptionsForProjectSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
    sectors: assessmentSectorsSelector(state),
});

const idSelector = d => d.id;
const titleSelector = d => d.title;

@connect(mapStateToProps)
export default class Methodology extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static orgIdSelector = organ => organ.id;
    static orgLabelSelector = organ => organ.title;
    static orgChildSelector = organ => organ.children;

    static orgValueKeySelector = item => item.id;
    static orgValueLabelSelector = item => item.name;

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

    renderAttributeRow = (dummy, attribute, index) => {
        const { aryTemplateMethodology: attributesTemplate } = this.props;
        const attributesTemplateKeys = Object.keys(attributesTemplate);
        const renderAttribute = (k, key) => this.renderAttribute(key, index);

        return (
            <div
                key={index}
                className={styles.row}
            >
                <List
                    data={attributesTemplateKeys}
                    modifier={renderAttribute}
                />
                <div className={styles.actionButtons}>
                    <DangerButton
                        iconName={iconNames.delete}
                        faramAction="remove"
                        faramElementIndex={index}
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
                    {pending && <LoadingAnimation large />}

                    <FaramList faramElementName="attributes">
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
                                                faramAction="add"
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
                        <CheckGroup
                            className={styles.focuses}
                            faramElementName="focuses"
                            title={focusesTitle}
                            options={focuses}
                            keySelector={idSelector}
                            labelSelector={titleSelector}
                        />
                        <CheckGroup
                            faramElementName="sectors"
                            title={sectorsTitle}
                            options={sectors}
                            className={styles.sectors}
                            keySelector={idSelector}
                            labelSelector={titleSelector}
                        />
                        <OrganigramWithList
                            faramElementName="affectedGroups"
                            title={affectedGroupsTitle}
                            className={styles.affectedGroups}
                            data={affectedGroups}
                            childSelector={Methodology.orgChildSelector}
                            labelSelector={Methodology.orgLabelSelector}
                            idSelector={Methodology.orgIdSelector}
                            valueKeySelector={Methodology.orgValueKeySelector}
                            valueLabelSelector={Methodology.orgValueLabelSelector}
                        />
                        <GeoListInput
                            faramElementName="locations"
                            title={locationsTitle}
                            className={styles.locationSelection}
                            geoOptionsByRegion={geoOptions}
                            regions={projectDetails.regions}
                        />
                    </section>

                    <div className={styles.methodologyContent}>
                        <Header
                            className={styles.header}
                            title={methodologyContentTitle}
                        />
                        <div className={styles.content}>
                            <TextArea
                                faramElementName="objectives"
                                className={styles.input}
                                placeholder={objectivesPlaceholder}
                                label={objectivesTitle}
                            />
                            <TextArea
                                faramElementName="dataCollectionTechniques"
                                className={styles.input}
                                placeholder={dataCollectionTechniquesPlaceholder}
                                label={dataCollectionTechniquesTitle}
                            />
                            <TextArea
                                faramElementName="sampling"
                                className={styles.input}
                                placeholder={samplingPlaceholder}
                                label={samplingTitle}
                            />
                            <TextArea
                                faramElementName="limitations"
                                className={styles.input}
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
