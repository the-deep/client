import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';
import { FaramGroup } from '@togglecorp/faram';

import ChecklistInput from '#rsci/ChecklistInput';
import LoadingAnimation from '#rscv/LoadingAnimation';

import _ts from '#ts';
import {
    assessmentSectorsSelector,
    assessmentSourcesSelector,
    focusesSelector,
    affectedGroupsSelector,

    projectDetailsSelector,
    geoOptionsForProjectSelector,
    editAryShouldShowProtectionInfo,
} from '#redux';

import OrganigramInput from '#components/input/OrganigramInput/';
import GeoInput from '#components/input/GeoInput/';

import Header from '../Header';

import styles from './styles.scss';

const protectionInfoItems = [
    {
        id: 1,
        title: 'Protection Monitoring',
    },
    {
        id: 2,
        title: 'Protection Needs Assessment',
    },
    {
        id: 3,
        title: 'Case Management',
    },
    {
        id: 4,
        title: 'Population Data',
    },
    {
        id: 5,
        title: 'Protection Response',
    },
    {
        id: 6,
        title: 'Communicating with(in) Affected Communities',
    },
    {
        id: 7,
        title: 'Security & Situational Awareness',
    },
    {
        id: 8,
        title: 'Sectoral Systems/Other',
    },
];

const propTypes = {
    affectedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    focuses: PropTypes.arrayOf(PropTypes.object).isRequired,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    sectors: PropTypes.arrayOf(PropTypes.object).isRequired,
    pending: PropTypes.bool,
    showProtectionInfo: PropTypes.bool,
};

const defaultProps = {
    geoOptions: {},
    pending: false,
    showProtectionInfo: false,
};

const mapStateToProps = state => ({
    affectedGroups: affectedGroupsSelector(state),
    focuses: focusesSelector(state),
    geoOptions: geoOptionsForProjectSelector(state),
    projectDetails: projectDetailsSelector(state),
    sectors: assessmentSectorsSelector(state),
    sources: assessmentSourcesSelector(state),
    showProtectionInfo: editAryShouldShowProtectionInfo(state),
});

const idSelector = d => String(d.id);
const titleSelector = d => d.title;

@connect(mapStateToProps)
export default class Focuses extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static orgIdSelector = organ => organ.id;
    static orgLabelSelector = organ => organ.title;
    static orgChildSelector = organ => organ.children;

    render() {
        const {
            sectors,
            focuses,
            affectedGroups,
            projectDetails,
            geoOptions,
            pending,
            showProtectionInfo,
        } = this.props;

        const focusesTitle = _ts('editAssessment.methodology', 'focusesTitle');
        const sectorsTitle = _ts('editAssessment.methodology', 'sectorsTitle');
        const affectedGroupsTitle = _ts('editAssessment.methodology', 'affectedGroupsTitle');
        const locationsTitle = _ts('editAssessment.methodology', 'locationsTitle');

        return (
            <div className={styles.focuses}>
                {pending && <LoadingAnimation />}
                <FaramGroup faramElementName="methodology">
                    <div className={_cs(styles.sectionItem)}>
                        <Header
                            title={focusesTitle}
                            className={styles.header}
                        />
                        <ChecklistInput
                            showLabel={false}
                            className={styles.content}
                            faramElementName="focuses"
                            options={focuses}
                            keySelector={idSelector}
                            labelSelector={titleSelector}
                        />
                    </div>
                    <div className={_cs(styles.sectionItem)}>
                        <Header
                            title={sectorsTitle}
                            className={styles.header}
                        />
                        <ChecklistInput
                            showLabel={false}
                            faramElementName="sectors"
                            options={sectors}
                            className={_cs(styles.content, styles.sectors)}
                            keySelector={idSelector}
                            labelSelector={titleSelector}
                        />
                        {showProtectionInfo && (
                            <>
                                <Header
                                    title="Protection Information Management"
                                    className={styles.header}
                                />
                                <ChecklistInput
                                    showLabel={false}
                                    faramElementName="protectionInfo"
                                    options={protectionInfoItems}
                                    className={styles.content}
                                    keySelector={idSelector}
                                    labelSelector={titleSelector}
                                />
                            </>
                        )}
                    </div>
                    <div className={_cs(styles.sectionItem)}>
                        <Header
                            className={styles.header}
                            title={affectedGroupsTitle}
                        />
                        <OrganigramInput
                            className={styles.content}
                            faramElementName="affectedGroups"
                            data={affectedGroups}
                            childSelector={Focuses.orgChildSelector}
                            labelSelector={Focuses.orgLabelSelector}
                            idSelector={Focuses.orgIdSelector}
                            showLabel={false}
                        />
                    </div>
                    <div className={_cs(styles.sectionItem)}>
                        <Header
                            className={styles.header}
                            title={locationsTitle}
                        />
                        <GeoInput
                            showLabel={false}
                            className={styles.content}
                            faramElementName="locations"
                            title={locationsTitle}
                            geoOptionsByRegion={geoOptions}
                            regions={projectDetails.regions}
                            showHintAndError={false}
                            polygonsEnabled
                        />
                    </div>
                </FaramGroup>
            </div>
        );
    }
}
