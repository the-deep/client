import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import { FaramGroup } from '@togglecorp/faram';
import { listToMap } from '@togglecorp/fujs';

import LoadingAnimation from '#rscv/LoadingAnimation';
import VerticalTabs from '#rscv/VerticalTabs/';
import TabTitle from '#components/general/TabTitle';

import {
    assessmentSectorsSelector,
    focusesSelector,
    editArySelectedSectorsSelector,
    editArySelectedFocusesSelector,
} from '#redux';

import {
    shouldShowHumanitarianAccess,
    shouldShowCrossSector,
} from '#entities/editAry';


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
    pending: PropTypes.bool,
    onActiveSectorChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    pending: false,
    onActiveSectorChange: undefined,
};

const mapStateToProps = state => ({
    selectedSectors: editArySelectedSectorsSelector(state),
    sectors: assessmentSectorsSelector(state),
    focuses: focusesSelector(state),
    selectedFocuses: editArySelectedFocusesSelector(state),
});

// FIXME: use ErrorIndicator for vertical tabs

const sectorIdentifier = 'sector';
const emptyObject = {};

@connect(mapStateToProps)
export default class Summary extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isTabForSector = key => key.startsWith(sectorIdentifier);
    static getSectorIdForSector = key => key.substr(sectorIdentifier.length + 1);

    constructor(props) {
        super(props);
        this.state = {
            activeTab: undefined,
        };

        this.tabs = emptyObject;
    }

    getSelectedSector = memoize((sectors, selectedSectorsList) => {
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

    getTabs = memoize((sectorTabs, humanitarianAccessVisibility, crossSectorVisibility) => {
        let tabs = {};

        if (crossSectorVisibility) {
            tabs = {
                ...tabs,
                crossSector: _ts('editAssessment.summary', 'crossSectorTitle'),
            };
        }
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

    getActiveTab = memoize((activeTabFromState, tabs) => {
        if (activeTabFromState) {
            return activeTabFromState;
        }

        const tabKeys = Object.keys(tabs);
        if (tabKeys.length > 0) {
            return tabKeys[0];
        }

        return undefined;
    })

    shouldShowHumanitarianAccess = memoize(shouldShowHumanitarianAccess)

    shouldShowCrossSector = memoize(shouldShowCrossSector)

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
            const sectorTabs = this.getSelectedSector(sectors, selectedSectors);
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

    renderTab = (tabKey, title) => (
        <TabTitle
            title={title}
            faramElementName={tabKey}
        />
    );

    renderTabs = () => {
        const { activeTab } = this.state;
        const {
            sectors,
            focuses,
            selectedSectors,
            selectedFocuses,
        } = this.props;

        const sectorTabs = this.getSelectedSector(sectors, selectedSectors);
        const humanitarianAccessVisibility = this.shouldShowHumanitarianAccess(
            focuses,
            selectedFocuses,
        );
        const crossSectorVisibility = this.shouldShowCrossSector(
            focuses,
            selectedFocuses,
        );

        this.tabs = this.getTabs(
            sectorTabs,
            humanitarianAccessVisibility,
            crossSectorVisibility,
        );

        return (
            <VerticalTabs
                className={styles.tabs}
                tabs={this.tabs}
                onClick={this.handleTabClick}
                active={this.getActiveTab(activeTab, this.tabs)}
                modifier={this.renderTab}
            />
        );
    }

    renderView = () => {
        // FIXME: use multiview container here
        const { activeTab: activeTabFromState } = this.state;
        const activeTab = this.getActiveTab(activeTabFromState, this.tabs);

        if (!activeTab) {
            return null;
        }

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
                    <Tabs />
                    <View />
                </FaramGroup>
            </div>
        );
    }
}
