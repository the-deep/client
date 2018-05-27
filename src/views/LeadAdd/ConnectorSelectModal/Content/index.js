import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import { reverseRoute } from '#rs/utils/common';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import Table from '#rs/components/View/Table';
import FormattedDate from '#rs/components/View/FormattedDate';
import Checkbox from '#rs/components/Input/Checkbox';
import AccentButton from '#rs/components/Action/Button/AccentButton';
import {
    iconNames,
    pathNames,
} from '#constants';
import _ts from '#ts';

import ConnectorLeadsGetRequest from '../../requests/ConnectorLeadsGetRequest';
import styles from './styles.scss';

const propTypes = {
    connectorLeads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    connectorId: PropTypes.number.isRequired,
    setConnectorLeads: PropTypes.func.isRequired,
    leadsUrlMap: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setConnectorLeadSelection: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    connectorLeads: [],
};

export default class ConnectorContent extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static leadKeySelector = l => l.key;

    constructor(props) {
        super(props);

        this.state = { connectorLeadsLoading: true };

        this.connectorLeadsHeader = [
            {
                key: 'selected',
                order: 1,
                labelModifier: () => {
                    const {
                        connectorLeads,
                        leadsUrlMap,
                    } = this.props;

                    const newLeads = connectorLeads.filter(d => (
                        !(d.existing || leadsUrlMap[d.url])
                    ));
                    const selectedNewLeads = newLeads.filter(d => d.isSelected);

                    const selectAllSelected = (
                        selectedNewLeads.length !== 0
                        && newLeads.length === selectedNewLeads.length
                    );

                    return (
                        <Checkbox
                            key="selectAll"
                            label=""
                            className={styles.selectAllCheckbox}
                            value={selectAllSelected}
                            onChange={() => this.props.onSelectAllClick({
                                connectorId: this.props.connectorId,
                                isSelected: !selectAllSelected,
                            })}
                        />
                    );
                },
                sortable: false,
                modifier: (row) => {
                    const { leadsUrlMap } = this.props;
                    if (leadsUrlMap[row.url] || row.existing) {
                        return (
                            <Checkbox
                                title={_ts('addLeads.connectorsSelect', 'leadAlreadyAdded')}
                                key="checkbox"
                                label=""
                                className={styles.checkbox}
                                value
                                disabled
                                onChange={() => {}}
                            />
                        );
                    }

                    return (
                        <Checkbox
                            key="checkbox"
                            label=""
                            className={styles.checkbox}
                            value={row.isSelected}
                            onChange={() => this.props.setConnectorLeadSelection({
                                key: row.key,
                                isSelected: !row.isSelected,
                                connectorId: this.props.connectorId,
                            })}
                        />
                    );
                },
            },
            {
                key: 'title',
                label: _ts('addLeads.connectorsSelect', 'titleLabel'),
                order: 2,
            },
            {
                key: 'publishedOn',
                label: _ts('addLeads.connectorsSelect', 'datePublishedLabel'),
                order: 3,
                modifier: row => (
                    <FormattedDate
                        className={styles.publishedDate}
                        date={row.publishedOn}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
        ];
    }

    componentWillMount() {
        if (this.props.connectorId) {
            this.startConnectorLeadsGetRequest(this.props.connectorId);
        }
    }

    componentWillUnmount() {
        if (this.requestForConnectorLeads) {
            this.requestForConnectorLeads.stop();
        }
    }

    startConnectorLeadsGetRequest = (connectorId) => {
        if (this.requestForConnectorLeads) {
            this.requestForConnectorLeads.stop();
        }
        const requestForConnectorLeads = new ConnectorLeadsGetRequest({
            setState: v => this.setState(v),
            setConnectorLeads: this.props.setConnectorLeads,
        });
        this.requestForConnectorLeads = requestForConnectorLeads.create(connectorId);
        this.requestForConnectorLeads.start();
    }

    handleRefreshButtonClick = () => {
        if (this.props.connectorId) {
            this.startConnectorLeadsGetRequest(this.props.connectorId);
        }
    }

    render() {
        const {
            connectorLeads = [],
            className,
            connectorId,
        } = this.props;
        const { connectorLeadsLoading } = this.state;
        const classNames = `${styles.connectorContent} ${className}`;

        return (
            <div className={classNames} >
                { connectorLeadsLoading && <LoadingAnimation large /> }
                <header className={styles.header} >
                    <div className={styles.rightContainer}>
                        <AccentButton
                            iconName={iconNames.refresh}
                            onClick={this.handleRefreshButtonClick}
                            className={styles.button}
                            transparent
                        />
                        <Link
                            className={styles.settingsLink}
                            target="_blank"
                            to={reverseRoute(pathNames.connectors, { connectorId })}
                        >
                            <span className={iconNames.settings} />
                        </Link>
                    </div>
                </header>
                <Table
                    className={styles.table}
                    data={connectorLeads}
                    headers={this.connectorLeadsHeader}
                    keyExtractor={ConnectorContent.leadKeySelector}
                />
            </div>
        );
    }
}
