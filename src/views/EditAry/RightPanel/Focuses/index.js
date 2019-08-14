import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { FaramGroup } from '@togglecorp/faram';
import ListSelection from '#rsci/ListSelection';
import LoadingAnimation from '#rscv/LoadingAnimation';

import _ts from '#ts';
import {
    assessmentSectorsSelector,
    assessmentSourcesSelector,
    focusesSelector,
    affectedGroupsSelector,

    projectDetailsSelector,
    geoOptionsForProjectSelector,
} from '#redux';

import OrganigramInput from '#components/input/OrganigramInput/';
import GeoInput from '#components/input/GeoInput/';

import Header from '../Header';

import styles from './styles.scss';

const propTypes = {
    affectedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    focuses: PropTypes.arrayOf(PropTypes.object).isRequired,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    sectors: PropTypes.arrayOf(PropTypes.object).isRequired,
    pending: PropTypes.bool,
};

const defaultProps = {
    geoOptions: {},
    pending: false,
};

const mapStateToProps = state => ({
    affectedGroups: affectedGroupsSelector(state),
    focuses: focusesSelector(state),
    geoOptions: geoOptionsForProjectSelector(state),
    projectDetails: projectDetailsSelector(state),
    sectors: assessmentSectorsSelector(state),
    sources: assessmentSourcesSelector(state),
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
        } = this.props;

        const focusesTitle = _ts('editAssessment.methodology', 'focusesTitle');
        const sectorsTitle = _ts('editAssessment.methodology', 'sectorsTitle');
        const affectedGroupsTitle = _ts('editAssessment.methodology', 'affectedGroupsTitle');
        const locationsTitle = _ts('editAssessment.methodology', 'locationsTitle');

        return (
            <div className={styles.focuses}>
                {pending && <LoadingAnimation />}
                <FaramGroup faramElementName="methodology">
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
                                childSelector={Focuses.orgChildSelector}
                                labelSelector={Focuses.orgLabelSelector}
                                idSelector={Focuses.orgIdSelector}
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
                </FaramGroup>
            </div>
        );
    }
}
