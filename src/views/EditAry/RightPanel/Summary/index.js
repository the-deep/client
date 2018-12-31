import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import FaramGroup from '#rscg/FaramGroup';
import LoadingAnimation from '#rscv/LoadingAnimation';
import VerticalTabs from '#rscv/VerticalTabs/';
import { listToMap } from '#rsu/common';

import {
    assessmentSectorsSelector,
    editArySelectedSectorsSelector,
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
    sectors: PropTypes.array.isRequired,
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
});

const sectorIdentifier = 'sector';

@connect(mapStateToProps)
export default class Summary extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'crossSector',
        };
    }

    handleTabClick = (key) => {
        this.setState({ activeTab: key }, () => {
            if (!this.props.onActiveSectorChange) {
                return;
            }

            let activeSector;
            if (key.startsWith(sectorIdentifier)) {
                activeSector = this.selectedSectors[key];
            }
            this.props.onActiveSectorChange(activeSector);
        });
    }

    renderTabs = () => {
        const {
            sectors,
            selectedSectors: selectedSectorsList,
        } = this.props;

        const { activeTab } = this.state;

        const s = sectors.filter(
            d => selectedSectorsList.indexOf(String(d.id)) !== -1,
        );
        const selectedSectors = listToMap(
            s,
            d => `${sectorIdentifier}-${d.id}`,
            d => d.title,
        );
        this.selectedSectors = selectedSectors;

        const tabs = {
            crossSector: _ts('editAssessment.summary', 'crossSectorTitle'),
            humanitarianAccess: _ts('editAssessment.summary', 'humanitarianAccessTitle'),
            ...selectedSectors,
        };

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
            default:
                if (activeTab.includes('sector')) {
                    const startIndex = sectorIdentifier.length + 1;
                    const sectorId = activeTab.substr(startIndex);

                    return (
                        <Sector
                            className={styles.view}
                            sectorId={sectorId}
                        />
                    );
                }
                return null;
        }
    }

    render() {
        const { className: classNameFromProps } = this.props;
        const className = _cs(
            classNameFromProps,
            'summary',
            styles.summary,
        );

        const Tabs = this.renderTabs;
        const View = this.renderView;

        return (
            <div className={className}>
                {this.props.pending && <LoadingAnimation />}
                <FaramGroup faramElementName="summary">
                    <View />
                </FaramGroup>
                <Tabs />
            </div>
        );
    }
}
