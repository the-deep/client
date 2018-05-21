import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import MultiViewContainer from '../../../vendor/react-store/components/View/MultiViewContainer';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import ListView from '../../../../src/vendor/react-store/components/View/List/ListView';
import LoadingAnimation from '../../../../src/vendor/react-store/components/View/LoadingAnimation';
import ListItem from '../../../../src/vendor/react-store/components/View/List/ListItem';
import SearchInput from '../../../vendor/react-store/components/Input/SearchInput';
import {
    caseInsensitiveSubmatch,
    reverseRoute,
} from '../../../vendor/react-store/utils/common';
import update from '../../../vendor/react-store/utils/immutable-update';
import {
    iconNames,
    pathNames,
} from '../../../constants';

import {
    addLeadViewConnectorsListSelector,
    projectIdFromRouteSelector,

    addLeadViewSetConnectorsAction,
    addLeadViewLeadsSelector,
} from '../../../redux';

import ConnectorsGetRequest from '../requests/ConnectorsGetRequest';
import ConnectorContent from './Content';
import _ts from '../../../ts';

import styles from './styles.scss';

const propTypes = {
    onModalClose: PropTypes.func.isRequired,
    connectorsList: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setConnectorsOfProject: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
    onLeadsSelect: PropTypes.func.isRequired,
    leads: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
};

const mapStateToProps = state => ({
    projectId: projectIdFromRouteSelector(state),
    connectorsList: addLeadViewConnectorsListSelector(state),
    leads: addLeadViewLeadsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setConnectorsOfProject: params => dispatch(addLeadViewSetConnectorsAction(params)),
});

const emptyList = [];
const emptyObject = {};

@connect(mapStateToProps, mapDispatchToProps)
export default class ConnectorSelectModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static connectorKeySelector = c => c.id;

    constructor(props) {
        super(props);

        const {
            connectorsList = emptyList,
            leads,
        } = props;

        const displayConnectorsList = connectorsList;
        const selectedConnector = displayConnectorsList.length > 0 ?
            displayConnectorsList[0].id : undefined;

        this.state = {
            searchInputValue: '',
            dataLoading: true,
            displayConnectorsList,
            selectedConnector,
            selectedLeads: emptyObject,
            connectorsLeads: emptyObject,
        };

        this.views = this.getContentViews(connectorsList);
        this.leadsUrlMap = this.getLeadsUrlMap(leads);
    }

    componentWillMount() {
        if (this.props.projectId) {
            this.startConnectorsRequest(this.props.projectId);
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            connectorsList: newConnectorsList,
            leads: newLeads,
        } = nextProps;
        const {
            connectorsList: oldConnectorsList,
            leads: oldLeads,
        } = this.props;
        const { searchInputValue } = this.state;

        if (newConnectorsList !== oldConnectorsList) {
            this.views = this.getContentViews(newConnectorsList);
            const displayConnectorsList = newConnectorsList.filter(
                c => caseInsensitiveSubmatch(c.title, searchInputValue),
            );
            this.setState({ displayConnectorsList });
        }

        if (newLeads !== oldLeads) {
            this.leadsUrlMap = this.getLeadsUrlMap(newLeads);
        }
    }

    componentWillUnmount() {
        if (this.requestForConnectors) {
            this.requestForConnectors.stop();
        }
    }

    getLeadsUrlMap = (leads) => {
        const leadsUrlMap = {};
        leads.forEach((l) => {
            const { faramValues: leadData = {} } = l;
            if (leadData.url) {
                leadsUrlMap[leadData.url] = leadData;
            }
        });
        return leadsUrlMap;
    }

    getContentViews = (connectors) => {
        const views = {};
        connectors.forEach((c) => {
            const view = {
                component: () => {
                    const {
                        selectedConnector,
                        connectorsLeads,
                    } = this.state;
                    return (
                        <ConnectorContent
                            connectorId={selectedConnector}
                            connectorLeads={connectorsLeads[selectedConnector]}
                            projectId={this.props.projectId}
                            className={styles.content}
                            setConnectorLeads={this.setConnectorLeads}
                            selectedLeads={this.state.selectedLeads[selectedConnector]}
                            setConnectorLeadSelection={this.setConnectorLeadSelection}
                            onSelectAllClick={this.handleSelectAllLead}
                            leadsUrlMap={this.leadsUrlMap}
                        />
                    );
                },
                mount: true,
                lazyMount: true,
                wrapContainer: true,
            };
            views[c.id] = view;
        });
        return views;
    }

    getFlatSelectedLeads = () => {
        const { selectedLeads } = this.state;

        const leads = Object.values(selectedLeads).reduce(
            (acc, selectedLead) => ([
                ...acc,
                ...(selectedLead || []),
            ]),
            [],
        );
        const filteredLeads = leads.filter((l) => {
            if (!l.existing && !this.leadsUrlMap[l.url]) {
                return l;
            }
            return null;
        });
        return filteredLeads;
    }

    setConnectorLeads = ({ connectorLeads, connectorId }) => {
        const settings = {
            connectorsLeads: { $auto: {
                [connectorId]: { $set: connectorLeads },
            } },
        };
        this.setState(update(this.state, settings));
    }

    setConnectorLeadSelection = ({ key, isSelected, connectorId }) => {
        const {
            connectorsLeads,
            selectedLeads,
        } = this.state;

        const connectorLeadIndex = connectorsLeads[connectorId].findIndex(l => l.key === key);

        const selectedLeadsForIndex = selectedLeads[connectorId] || [];
        const selectedLeadsIndex = selectedLeadsForIndex.findIndex(l => l.key === key);

        const lead = connectorsLeads[connectorId][connectorLeadIndex];
        const settings = {
            connectorsLeads: { $auto: {
                [connectorId]: {
                    [connectorLeadIndex]: {
                        isSelected: { $set: isSelected },
                    },
                },
            } },
        };

        if (selectedLeadsIndex === -1) {
            settings.selectedLeads = { $auto: {
                [connectorId]: { $autoArray: {
                    $push: [lead],
                } },
            } };
        } else {
            settings.selectedLeads = { $auto: {
                [connectorId]: { $autoArray: {
                    $splice: [[selectedLeadsIndex, 1]],
                } },
            } };
        }

        this.setState(update(this.state, settings));
    }

    handleSelectAllLead = ({ connectorId, isSelected }) => {
        const { connectorsLeads } = this.state;
        const connectorLeads = connectorsLeads[connectorId] || [];

        if (connectorLeads.length > 0) {
            const part = connectorLeads.reduce(
                (acc, val, index) => ({
                    ...acc,
                    [index]: { isSelected: { $set: isSelected } },
                }),
                {},
            );
            const settings = {
                connectorsLeads: { $auto: {
                    [connectorId]: part,
                } },
            };
            if (isSelected) {
                settings.selectedLeads = { $auto: {
                    [connectorId]: { $set: connectorLeads },
                } };
            } else {
                settings.selectedLeads = { $auto: {
                    [connectorId]: { $set: [] },
                } };
            }
            this.setState(update(this.state, settings));
        }
    }

    startConnectorsRequest = (projectId) => {
        if (this.requestForConnectors) {
            this.requestForConnectors.stop();
        }
        const requestForConnectors = new ConnectorsGetRequest({
            setState: v => this.setState(v),
            setConnectorsOfProject: this.props.setConnectorsOfProject,
        });
        this.requestForConnectors = requestForConnectors.create(projectId);
        this.requestForConnectors.start();
    }

    handleSearchInputChange = (searchInputValue) => {
        const displayConnectorsList = this.props.connectorsList.filter(
            c => caseInsensitiveSubmatch(c.title, searchInputValue),
        );

        this.setState({
            displayConnectorsList,
            searchInputValue,
        });
    };

    handleConnectorSelectModalClose = () => this.props.onModalClose();

    handleLeadsSelect = () => {
        const selectedLeads = this.getFlatSelectedLeads();

        if (selectedLeads.length > 0) {
            this.props.onLeadsSelect(selectedLeads);
        }
    }

    handleConnectorClick = (selectedConnector) => {
        this.setState({ selectedConnector });
    }

    renderConnectorListItem = (key, connector) => {
        const { selectedConnector } = this.state;
        const isActive = connector.id === selectedConnector;

        return (
            <ListItem
                active={isActive}
                key={connector.id}
                onClick={() => this.handleConnectorClick(connector.id)}
            >
                {connector.title}
            </ListItem>
        );
    }

    renderSidebar = () => {
        const {
            displayConnectorsList,
            searchInputValue,
        } = this.state;

        return (
            <div className={styles.sidebar}>
                <header className={styles.header}>
                    <SearchInput
                        onChange={this.handleSearchInputChange}
                        placeholder={_ts('addLeads.connectorsSelect', 'searchConnectorPlaceholder')}
                        className={styles.searchInput}
                        value={searchInputValue}
                        showLabel={false}
                        showHintAndError={false}
                    />
                </header>
                <ListView
                    className={styles.connectorsList}
                    data={displayConnectorsList}
                    keyExtractor={ConnectorSelectModal.connectorKeySelector}
                    modifier={this.renderConnectorListItem}
                />
            </div>
        );
    }

    renderConnectorContent = () => {
        const { selectedConnector } = this.state;
        const {
            connectorsList,
        } = this.props;

        if (connectorsList.length <= 0) {
            return (
                <div className={styles.empty}>
                    { _ts('addLeads.connectorsSelect', 'noConnectorsLabel') }
                </div>
            );
        }

        return (
            <MultiViewContainer
                active={selectedConnector}
                views={this.views}
                containerClassName={styles.content}
            />
        );
    }

    render() {
        const { dataLoading } = this.state;

        const Sidebar = this.renderSidebar;
        const Content = this.renderConnectorContent;

        const isSelectionEmpty = this.getFlatSelectedLeads().length <= 0;

        return (
            <Modal className={styles.modal} >
                <ModalHeader
                    title={_ts('addLeads.connectorsSelect', 'connectorsLabel')}
                    rightComponent={
                        <div className={styles.rightButtons} >
                            <Link
                                className={styles.settingsLink}
                                target="_blank"
                                to={reverseRoute(pathNames.connectors, { })}
                            >
                                <span className={iconNames.settings} />
                            </Link>
                            <PrimaryButton
                                onClick={this.handleConnectorSelectModalClose}
                                transparent
                            >
                                <span className={iconNames.close} />
                            </PrimaryButton>
                        </div>
                    }
                />
                <ModalBody className={styles.modalBody} >
                    { dataLoading && <LoadingAnimation large /> }
                    <div className={styles.main} >
                        <Sidebar />
                        <Content />
                    </div>
                    <div className={styles.footer} >
                        <DangerButton
                            onClick={this.handleConnectorSelectModalClose}
                        >
                            {_ts('addLeads.connectorsSelect', 'modalCancelLabel')}
                        </DangerButton>
                        <PrimaryButton
                            onClick={this.handleLeadsSelect}
                            disabled={isSelectionEmpty}
                        >
                            {_ts('addLeads.connectorsSelect', 'modalSelectLabel')}
                        </PrimaryButton>
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}
