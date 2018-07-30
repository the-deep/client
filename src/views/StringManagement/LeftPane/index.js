import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import VerticalTabs from '#rscv/VerticalTabs';
import SearchInput from '#rsci/SearchInput';

import {
    stringMgmtSetSelectedLinkCollectionNameAction,

    linkKeysSelector,
    problemCollectionsStatsSelector,
    selectedLinkCollectionNameSelector,
} from '#redux';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    problemCollectionsStats: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    linkKeys: PropTypes.object.isRequired,

    linkCollectionName: PropTypes.string.isRequired,
    setSelectedLinkCollectionName: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    problemCollectionsStats: problemCollectionsStatsSelector(state),
    linkKeys: linkKeysSelector(state),
    linkCollectionName: selectedLinkCollectionNameSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSelectedLinkCollectionName: params => dispatch(
        stringMgmtSetSelectedLinkCollectionNameAction(params),
    ),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class LeftPane extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleTabLinkClick = (name) => {
        this.props.setSelectedLinkCollectionName(name);
    }

    // FIXME: separate component
    renderTabLink = (key, data) => {
        const {
            warningCount = 0,
            errorCount = 0,
            infoCount = 0,
        } = this.props.problemCollectionsStats[key] || {};

        return (
            <div
                key={key}
                className={styles.item}
            >
                <pre className={styles.title}>
                    {data}
                </pre>
                { infoCount > 0 &&
                    <span className={`${styles.badge} ${styles.info}`}>
                        {infoCount}
                    </span>
                }
                { warningCount > 0 &&
                    <span className={`${styles.badge} ${styles.warning}`}>
                        {warningCount}
                    </span>
                }
                { errorCount > 0 &&
                    <span className={`${styles.badge} ${styles.error}`}>
                        {errorCount}
                    </span>
                }
            </div>
        );
    }

    render() {
        const { linkKeys, linkCollectionName } = this.props;

        return (
            <div className={styles.leftPane}>
                <header className={styles.header}>
                    <h3>
                        Strings
                    </h3>
                    <SearchInput
                        disabled
                        placeholder="Search View"
                        showLabel={false}
                        showHintAndError={false}
                    />
                </header>
                <VerticalTabs
                    className={styles.links}
                    tabs={linkKeys}
                    active={linkCollectionName}
                    onClick={this.handleTabLinkClick}
                    modifier={this.renderTabLink}
                />
            </div>
        );
    }
}
