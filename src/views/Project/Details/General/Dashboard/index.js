import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import SelectInput from '#rsci/SelectInput';
import FormattedDate from '#rscv/FormattedDate';
import SparkLines from '#rscz/SparkLines';
import Numeral from '#rscv/Numeral';
import Message from '#rscv/Message';

import RegionMap from '#components/RegionMap';
import { RequestCoordinator, RequestClient, requestMethods } from '#request';
import { createUrlForProject } from '#rest/projects';

import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
    projectRequest: PropTypes.shape({
        pending: PropTypes.bool,
        response: PropTypes.object,
    }).isRequired,
};

const defaultProps = {
    className: '',
};


// eslint-disable-next-line no-underscore-dangle
const _cs = (...names) => names.join(' ');

const calcTopValues = (array, count, selector) => {
    const sortedArray = [...array]
        .sort((a, b) => selector(a) - selector(b));

    // In case when last several values are equal,
    // we take them all even if num > count.
    let num = count;
    for (; num <= sortedArray.length; num += 1) {
        if (sortedArray[num - 1] === sortedArray[num]) {
            num += 1;
        }
    }

    return sortedArray.slice(0, num);
};

const calcTopSourcers = memoize(project =>
    calcTopValues(project.memberships, 3, p => p.numberOfLeads));

const calcTopTaggers = memoize(project =>
    calcTopValues(project.memberships, 3, p => p.numberOfEntries));

const requests = {
    projectRequest: {
        onMount: true,
        onPropsChanged: ['projectId'],
        method: requestMethods.GET,
        url: props => createUrlForProject(props.projectId),
    },
};

@RequestCoordinator
@RequestClient(requests)
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

    getClassName = () => _cs(
        this.props.className,
        'project-dashboard',
        styles.projectDashboard,
    )

    handleRegionChange = (selectedRegion) => {
        this.setState({ selectedRegion });
    }

    renderLeadsActivity = () => (
        <div className={styles.chart}>
            <h4>
                Leads Activity - Last 7 Days
            </h4>
            <SparkLines
                className={styles.sparkLine}
                data={this.props.projectRequest.response.leadsActivity}
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
            <h4>
                Entries Activity - Last 7 Days
            </h4>
            <SparkLines
                className={styles.sparkLine}
                data={this.props.projectRequest.response.entriesActivity}
                yValueSelector={ProjectDashboard.activityCountSelector}
                xValueSelector={ProjectDashboard.activityDateSelector}
                xLabelModifier={ProjectDashboard.activityDateModifier}
                yLabelModifier={ProjectDashboard.entriesActivityNumberModifier}
                fill
            />
        </div>
    )

    renderSourcers = () => {
        const { projectRequest: { response: project } } = this.props;
        const sourcers = calcTopSourcers(project);

        return (
            <div className={styles.userTable}>
                <h4> Top sourcers </h4>
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
        const { projectRequest: { response: project } } = this.props;
        const taggers = calcTopTaggers(project);

        return (
            <div className={styles.userTable}>
                <h4> Top taggers </h4>
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
        const { projectRequest: { response: project } } = this.props;

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
        const { projectRequest: { response: project } } = this.props;

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
        <div className={_cs(styles.row, styles.metadata)}>
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
        const { projectRequest: { response: { regions } } } = this.props;
        if (regions.length === 0) {
            return (
                <div className={_cs(styles.row, styles.map)}>
                    <Message>
                        There is no geo region for this project.
                    </Message>
                </div>
            );
        }

        const selectedRegion = this.state.selectedRegion || regions[0].id;

        return (
            <div className={_cs(styles.row, styles.map)}>
                <RegionMap regionId={selectedRegion} />
                <SelectInput
                    className={styles.regionSelectInput}
                    options={regions}
                    keySelector={ProjectDashboard.regionKeySelector}
                    labelSelector={ProjectDashboard.regionLabelSelector}
                    value={selectedRegion}
                    onChange={this.handleRegionChange}
                    showHintAndError={false}
                    hideClearButton
                />
            </div>
        );
    }

    render() {
        const className = this.getClassName();
        const Metadata = this.renderMetadata;
        const Map = this.renderMap;

        if (!this.props.projectRequest.response) {
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
