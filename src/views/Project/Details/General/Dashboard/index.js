import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import SelectInput from '#rsci/SelectInput';
import FormattedDate from '#rscv/FormattedDate';
import SparkLines from '#rscz/SparkLines';
import Numeral from '#rscv/Numeral';
import Message from '#rscv/Message';

import RegionMap from '#components/RegionMap';
import RequestCoordinator from '#components/RequestCoordinator';
import { createUrlForProject } from '#rest/projects';

import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
    project: PropTypes.shape({
        createdAt: PropTypes.string,
        createdByName: PropTypes.string,
        numberOfUsers: PropTypes.number,
        statusTitle: PropTypes.string,

        numberOfLeads: PropTypes.number,
        leadsActivity: PropTypes.array,

        numberOfEntries: PropTypes.number,
        entriesActivity: PropTypes.array,
        regions: PropTypes.array,

        memberships: PropTypes.array,
    }),
};

const defaultProps = {
    className: '',
    project: undefined,
};


const classNames = memoize((...names) => names.join(' '));

const calcTopSourcers = memoize((project) => {
    const sortedMemberships = [...project.memberships]
        .sort((p1, p2) => p1.numberOfLeads - p2.numberOfLeads);

    // FIXME: Do not just slice at 3 for cases when values may be equal.
    return sortedMemberships.slice(0, 3);
});
const calcTopTaggers = memoize((project) => {
    const sortedMemberships = [...project.memberships]
        .sort((p1, p2) => p1.numberOfEntries - p2.numberOfEntries);

    // FIXME: Do not just slice at 3 for cases when values may be equal.
    return sortedMemberships.slice(0, 3);
});


@RequestCoordinator({
    initalRequest: {
        key: 'project',
        dependencies: ['projectId'],
        method: 'get',
        requestData: ({ projectId }) => ({
            url: createUrlForProject(projectId),
        }),
        pendingAction: 'hide',
        loadingComponent: () => <div>Loading</div>,
    },
})
export default class ProjectDashboard extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static activityCountSelector = a => a.count;
    static activityDateSelector = a => new Date(a.date).getTime();
    static activityDateModifier = d => `
        Date:
        ${FormattedDate.format(new Date(d), 'dd-MM-yyyy')}
    `;
    static leadsActivityNumberModifier = d => `Leads: ${d}`;
    static entriesActivityNumberModifier = d => `Entries: ${d}`;

    static regionKeySelector = r => r.id;
    static regionLabelSelector = r => r.title;

    constructor(props) {
        super(props);

        this.state = {
            selectedRegion: undefined,
        };
    }

    getClassName = () => classNames(
        this.props.className,
        'project-dashboard',
        styles.projectDashboard,
    )

    handleRegionChange = (selectedRegion) => {
        this.setState({ selectedRegion });
    }

    renderLeadsActivity = () => (
        <div className={styles.chart}>
            <h3> Leads Activity </h3>
            <SparkLines
                className={styles.sparkLine}
                data={this.props.project.leadsActivity}
                yValueSelector={ProjectDashboard.activityCountSelector}
                xValueSelector={ProjectDashboard.activityDateSelector}
                xLabelModifier={ProjectDashboard.activityDateModifier}
                yLabelModifier={ProjectDashboard.leadsActivityNumberModifier}
                fill
            />
        </div>
    )

    renderEntriesActivity = () => (
        <div className={styles.chart}>
            <h3> Entries Activity </h3>
            <SparkLines
                className={styles.sparkLine}
                data={this.props.project.entriesActivity}
                yValueSelector={ProjectDashboard.activityCountSelector}
                xValueSelector={ProjectDashboard.activityDateSelector}
                xLabelModifier={ProjectDashboard.activityDateModifier}
                yLabelModifier={ProjectDashboard.entriesActivityNumberModifier}
                fill
            />
        </div>
    )

    renderSourcers = () => {
        const { project } = this.props;
        const sourcers = calcTopSourcers(project);

        return (
            <div className={styles.userTable}>
                <h3> Top sourcers </h3>
                {sourcers.map(sourcer => (
                    <div className={styles.user} key={sourcer.id}>
                        <div className={styles.name}>
                            {sourcer.memberName}
                        </div>
                        <Numeral
                            value={(sourcer.numberOfLeads / project.numberOfLeads) * 100}
                            suffix="%"
                            precision={0}
                        />
                    </div>
                ))}
            </div>
        );
    }

    renderTaggers = () => {
        const { project } = this.props;
        const taggers = calcTopTaggers(project);

        return (
            <div className={styles.userTable}>
                <h3> Top taggers </h3>
                {taggers.map(tagger => (
                    <div className={styles.user} key={tagger.id}>
                        <div className={styles.name}>
                            {tagger.memberName}
                        </div>
                        <Numeral
                            value={(tagger.numberOfEntries / project.numberOfEntries) * 100}
                            suffix="%"
                            precision={0}
                        />
                    </div>
                ))}
            </div>
        );
    }

    renderSummary = () => {
        const { project } = this.props;

        return (
            <div className={styles.summary}>
                <div className={styles.summaryItem}>
                    <Numeral
                        className={styles.value}
                        precision={0}
                        value={project.numberOfLeads}
                    />
                    <div className={styles.label}>
                        Total leads
                    </div>
                </div>
                <div className={styles.summaryItem}>
                    <Numeral
                        className={styles.value}
                        precision={0}
                        value={project.numberOfEntries}
                    />
                    <div className={styles.label}>
                        Total entries
                    </div>
                </div>
                <div className={styles.summaryItem}>
                    <Numeral
                        className={styles.value}
                        precision={0}
                        value={project.numberOfUsers}
                    />
                    <div className={styles.label}>
                        Total users
                    </div>
                </div>
            </div>
        );
    }

    renderInfo = () => {
        const { project } = this.props;

        return (
            <div className={styles.info}>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        Project status
                    </div>
                    <div className={styles.value}>
                        {project.statusTitle}
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        Created by
                    </div>
                    <div className={styles.value}>
                        {project.createdByName}
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        Created at
                    </div>
                    <FormattedDate
                        className={styles.value}
                        date={project.createdAt}
                        mode="dd-MM-yyyy"
                    />
                </div>
            </div>
        );
    }

    renderMetadata = () => (
        <div className={classNames(styles.row, styles.metadata)}>
            <div className={styles.leftSection}>
                <div className={styles.topSection}>
                    {this.renderLeadsActivity()}
                    {this.renderEntriesActivity()}
                </div>
                <div className={styles.bottomSection}>
                    {this.renderSourcers()}
                    {this.renderTaggers()}
                </div>
            </div>
            <div className={styles.rightSection}>
                <div className={styles.topSection}>
                    {this.renderInfo()}
                </div>
                <div className={styles.bottomSection}>
                    {this.renderSummary()}
                </div>
            </div>
        </div>
    )

    renderMap = () => {
        const { regions } = this.props.project;
        if (regions.length === 0) {
            return (
                <div className={classNames(styles.row, styles.map)}>
                    <Message>
                        There is no geo region for this project.
                    </Message>
                </div>
            );
        }

        const selectedRegion = this.state.selectedRegion || regions[0].id;

        return (
            <div className={classNames(styles.row, styles.map)}>
                <RegionMap regionId={selectedRegion} />
                <SelectInput
                    className={styles.regionSelectInput}
                    options={regions}
                    keySelector={ProjectDashboard.regionKeySelector}
                    labelSelector={ProjectDashboard.regionLabelSelector}
                    value={selectedRegion}
                    onChange={this.handleRegionChange}
                    showHintAndError={false}
                />
            </div>
        );
    }

    render() {
        const className = this.getClassName();
        const Metadata = this.renderMetadata;
        const Map = this.renderMap;

        if (!this.props.project) {
            return (
                <div className={className} />
            );
        }

        return (
            <div className={className}>
                <Metadata />
                <Map />
            </div>
        );
    }
}
