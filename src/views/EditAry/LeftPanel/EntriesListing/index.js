import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { reverseRoute } from '@togglecorp/fujs';
import Label from '#rsci/Label';
import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    editAryEntriesSelector,
    setEntriesForEditAryAction,
    projectIdFromRouteSelector,
} from '#redux';
import { pathNames } from '#constants';
import _ts from '#ts';
import _cs from '#cs';

import EntriesRequest from './requests/EntriesRequest';
import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.number.isRequired,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setEntries: PropTypes.func.isRequired,
    activeProjectId: PropTypes.number.isRequired,
    activeSector: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    activeSector: undefined,
    className: undefined,
};

const mapStateToProps = state => ({
    entries: editAryEntriesSelector(state),
    activeProjectId: projectIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setEntries: params => dispatch(setEntriesForEditAryAction(params)),
});

// const emptyObject = {};

@connect(mapStateToProps, mapDispatchToProps)
export default class EntriesListing extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static calcEntryKey = entry => entry.id;

    /*
    static calcEntryWithSector = (entry) => {
        console.warn(entry);
        const attr = entry.attributes.find(
            a => (a.widgetObj || emptyObject).widgetId === 'matrix2dWidget',
        );
        if (!attr) {
            return { ...entry, sectors: [] };
        }

        const widgetProps = attr.widgetObj.properties.data;
        const { sectors } = widgetProps;

        const selectedSectorIds = Object.values(attr.data).reduce(
            (acc, b) => [
                ...acc,
                ...Object.values(b).reduce((acc2, c) => [...acc2, ...Object.keys(c)], [])],
            [],
        );
        const selectedSectors = selectedSectorIds.map(id => sectors.find(s => s.id === id));

        return {
            ...entry,
            sectors: selectedSectors.map(s => s.title),
        };
    }
    */

    constructor(props) {
        super(props);

        this.state = {
            pendingEntries: true,
            entries: this.filterEntries(props.entries, props.activeSector),
        };
    }

    componentWillMount() {
        const { leadId } = this.props;

        const request = new EntriesRequest({
            setState: params => this.setState(params),
            setEntries: this.props.setEntries,
        });
        this.entriesRequest = request.create(leadId);
        this.entriesRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.leadId !== nextProps.leadId) {
            if (this.entriesRequest) {
                this.entriesRequest.stop();
            }

            const request = new EntriesRequest({
                setState: params => this.setState(params),
                setEntries: this.props.setEntries,
            });
            this.entriesRequest = request.create(nextProps.leadId);
            this.entriesRequest.start();
        }

        if (
            this.props.entries !== nextProps.entries ||
            this.props.activeSector !== nextProps.activeSector
        ) {
            this.setState({
                entries: this.filterEntries(nextProps.entries, nextProps.activeSector),
            });
        }
    }

    componentWillUnmount() {
        if (this.entriesRequest) {
            this.entriesRequest.stop();
        }
    }

    filterEntries = (entries, activeSector) => {
        if (!activeSector) {
            return entries;
        }

        // TODO: filter entries when sector is selected
        return entries;
        /*
        const entriesWithSectors = entries.map(EntriesListing.calcEntryWithSector);
        return entriesWithSectors.filter(
            e => e.sectors.indexOf(activeSector) >= 0,
        );
        */
    }

    renderEntryLabel = (entry) => {
        const {
            entryType,
            excerpt,
            tabularFieldData,
            order,
            imageDetails,
            imageRaw,
        } = entry;

        if (entryType === 'image') {
            return (
                <img
                    className={styles.image}
                    src={imageDetails?.file ?? imageRaw}
                    alt={_ts('editAssessment.entriesListing', 'altLabel')}
                />
            );
        }

        if (entryType === 'dataSeries') {
            return (
                <div className={styles.entryExcerpt}>
                    { tabularFieldData.title }
                </div>
            );
        }

        // FIXME: use strings
        const excerptTitle = excerpt || `Excerpt ${order}`;
        return (
            <div className={styles.entryExcerpt}>
                {excerptTitle}
            </div>
        );
    }

    renderEntryItem = (key, entry) => (
        <div
            key={key}
            className={styles.entriesListItem}
        >
            <div className={styles.addEntryListItem} >
                {this.renderEntryLabel(entry)}
            </div>
        </div>
    )

    render() {
        const { className } = this.props;
        const linkToEditEntries = reverseRoute(
            pathNames.editEntries,
            {
                projectId: this.props.activeProjectId,
                leadId: this.props.leadId,
            },
        );
        const {
            entries = [],
            pendingEntries,
        } = this.state;
        const noOfEntries = entries.length;

        return (
            <div className={_cs(className, styles.entriesListing)}>
                { pendingEntries && <LoadingAnimation />}
                <ListView
                    className={styles.entriesList}
                    modifier={this.renderEntryItem}
                    data={entries}
                    keySelector={EntriesListing.calcEntryKey}
                />
                <div className={styles.leadDetail}>
                    <div className={styles.noOfEntriesWrap}>
                        <Label
                            className={styles.label}
                            show
                            text={_ts('editAssessment.entriesListing', 'noOfEntriesText')}
                        />
                        {noOfEntries}
                    </div>
                    <Link
                        to={linkToEditEntries}
                        className={styles.editEntriesLink}
                    >
                        {_ts('editAssessment.entriesListing', 'editEntriesText')}
                    </Link>
                </div>
            </div>
        );
    }
}
