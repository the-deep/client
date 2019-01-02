import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import FaramGroup from '#rscg/FaramGroup';
import LoadingAnimation from '#rscv/LoadingAnimation';
import VerticalTabs from '#rscv/VerticalTabs/';
import { listToMap } from '#rsu/common';

import {
    assessmentSectorsSelector,
    focusesSelector,
    editArySelectedSectorsSelector,
    editArySelectedFocusesSelector,
} from '#redux';
import _ts from '#ts';
import _cs from '#cs';

import CrossSector from './CrossSector';
import HumanitarianAccess from './HumanitarianAccess';
import Sector from './Sector';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    selectedSectors: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    selectedFocuses: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    sectors: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    focuses: PropTypes.array.isRequired,
    pending: PropTypes.bool.isRequired,
    onActiveSectorChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    onActiveSectorChange: undefined,
};

const mapStateToProps = state => ({
    selectedSectors: editArySelectedSectorsSelector(state),
    sectors: assessmentSectorsSelector(state),
    focuses: focusesSelector(state),
    selectedFocuses: editArySelectedFocusesSelector(state),
});

const sectorIdentifier = 'sector';

@connect(mapStateToProps)
export default class Summary extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isTabForSector = key => key.startsWith(sectorIdentifier);

    static getSectorIdForSector = key => key.substr(sectorIdentifier.length + 1);

    static getSelectedSector = memoize((sectors, selectedSectorsList) => {
        const selectedSectorsMap = listToMap(
            selectedSectorsList,
            d => d,
            () => true,
        );

        const selectedSectors = listToMap(
            sectors.filter(d => selectedSectorsMap[d.id]),
            d => `${sectorIdentifier}-${d.id}`,
            d => d.title,
        );

        return selectedSectors;
    })

    // FIXME: this should be more dynamic later on
    static shouldShowHumanitarianAccess = memoize((focuses, selectedFocuses) => {
        const humanitarianAccessFocus = focuses.find(
            focus => focus.title.toLowerCase() === 'humanitarian access',
        );
        if (!humanitarianAccessFocus) {
            return false;
        }
        const index = selectedFocuses.findIndex(
            focus => String(focus) === String(humanitarianAccessFocus.id),
        );
        return index !== -1;
    })

    static getTabs = memoize((sectorTabs, humanitarianAccessVisibility) => {
        let tabs = {
            crossSector: _ts('editAssessment.summary', 'crossSectorTitle'),
        };
        if (humanitarianAccessVisibility) {
            tabs = {
                ...tabs,
                humanitarianAccess: _ts('editAssessment.summary', 'humanitarianAccessTitle'),
            };
        }
        tabs = {
            ...tabs,
            ...sectorTabs,
        };
        return tabs;
    })

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'crossSector',
        };
    }

    handleActiveSectorChange = (key) => {
        const {
            onActiveSectorChange,
            sectors,
            selectedSectors,
        } = this.props;

        if (!onActiveSectorChange) {
            return;
        }

        let activeSector;
        if (Summary.isTabForSector(key)) {
            const sectorTabs = Summary.getSelectedSector(sectors, selectedSectors);
            activeSector = sectorTabs[key];
        }
        onActiveSectorChange(activeSector);
    }

    handleTabClick = (key) => {
        this.setState(
            { activeTab: key },
            () => this.handleActiveSectorChange(key),
        );
    }

    renderTabs = () => {
        const { activeTab } = this.state;
        const {
            sectors,
            focuses,
            selectedSectors,
            selectedFocuses,
        } = this.props;

        const sectorTabs = Summary.getSelectedSector(sectors, selectedSectors);
        const humanitarianAccessVisibility = Summary.shouldShowHumanitarianAccess(
            focuses,
            selectedFocuses,
        );
        const tabs = Summary.getTabs(sectorTabs, humanitarianAccessVisibility);

        return (
            <VerticalTabs
                className={styles.tabs}
                tabs={tabs}
                onClick={this.handleTabClick}
                active={activeTab}
            />
        );
    }

    renderView = () => {
        const { activeTab } = this.state;

        switch (activeTab) {
            case 'crossSector':
                return (
                    <CrossSector className={styles.view} />
                );
            case 'humanitarianAccess':
                return (
                    <HumanitarianAccess className={styles.view} />
                );
            default: {
                if (!Summary.isTabForSector(activeTab)) {
                    return null;
                }
                const sectorId = Summary.getSectorIdForSector(activeTab);
                return (
                    <Sector
                        className={styles.view}
                        sectorId={sectorId}
                    />
                );
            }
        }
    }

    render() {
        const {
            className: classNameFromProps,
            pending,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            'summary',
            styles.summary,
        );

        const Tabs = this.renderTabs;
        const View = this.renderView;

        return (
            <div className={className}>
                {pending && <LoadingAnimation />}
                <FaramGroup faramElementName="summary">
                    <View />
                </FaramGroup>
                <Tabs />
            </div>
        );
    }
}
