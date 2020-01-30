import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    caseInsensitiveSubmatch,
    reverseRoute,
    compareStringSearch,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import SearchInput from '#rsci/SearchInput';
import ListView from '#rscv/List/ListView';
import Message from '#rscv/Message';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import MultiViewContainer from '#rscv/MultiViewContainer';
import update from '#rsu/immutable-update';
import { transformAndCombineResponseErrors } from '#rest';

import { pathNames } from '#constants';
import {
    RequestClient,
    methods,
} from '#request';

import { projectIdFromRouteSelector } from '#redux';

import notify from '#notify';
import _ts from '#ts';

import ConnectorContent from './Content';
import ConnectorListItem from './ConnectorItem';

import styles from './styles.scss';

const propTypes = {
    closeModal: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
    onLeadsSelect: PropTypes.func.isRequired,
    leads: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
};

const mapStateToProps = state => ({
    projectId: projectIdFromRouteSelector(state),
});

const emptyList = [];
const emptyObject = {};

const requestOptions = {
    connectorsGetRequest: {
        url: '/connectors/',
        onMount: true,
        method: methods.GET,
        query: ({ props: { projectId } }) => ({
            projects: [projectId],
            fields: [
                'id',
                'title',
                'version_id',
                'source',
                'role',
                'filters',
                'source_title',
                'status',
            ],
        }),
        onSuccess: ({
            response: { results = [] },
            params: { setConnectorsList },
        }) => {
            const filteredConnectorsList = results.filter(c => c.status === 'working');
            setConnectorsList(filteredConnectorsList);
        },
        onFailure: ({ errros: { response } }) => {
            const message = transformAndCombineResponseErrors(response.errors);
            notify.send({
                title: _ts('addLeads', 'connectorTitle'),
                type: notify.type.ERROR,
                message,
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'connectors',
        },
    },
};

@connect(mapStateToProps)
@RequestClient(requestOptions)
export default class ConnectorSelectModal extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static connectorKeySelector = c => c.id;

    static connectorSourceSelector = c => c.sourceTitle;

    constructor(props) {
        super(props);

        const {
            requests: {
                connectorsGetRequest,
            },
        } = props;

        connectorsGetRequest.setDefaultParams({
            setConnectorsList: this.setConnectorsList,
        });

        this.state = {
            searchInputValue: '',
            connectorsList: [],
            selectedConnector: undefined,
            selectedLeads: emptyObject,
            connectorsLeads: emptyObject,
            filtersData: emptyObject,
        };
    }

    getListAfterSearch = memoize((connectorsList = emptyList, searchInputValue) => (
        connectorsList
            .filter(c => caseInsensitiveSubmatch(c.title, searchInputValue))
            .sort((a, b) => compareStringSearch(a.title, b.title, searchInputValue))
    ))

    getLeadsUrlMap = memoize((leads) => {
        const leadsUrlMap = {};
        leads.forEach((l) => {
            const { faramValues: leadData = {} } = l;
            if (leadData.url) {
                leadsUrlMap[leadData.url] = leadData;
            }
        });
        return leadsUrlMap;
    })

    getContentViews = memoize((connectors) => {
        const views = {};
        connectors.forEach((c) => {
            const view = {
                component: () => {
                    const {
                        selectedConnector,
                        connectorsLeads: {
                            [selectedConnector]: {
                                leads,
                                count,
                                activePage,
                                countPerPage,
                            } = {},
                        } = {},
                        filtersData,
                        connectorsList,
                        selectedLeads,
                    } = this.state;

                    const {
                        leads: leadsFromProps,
                        projectId,
                    } = this.props;

                    const leadsUrlMap = this.getLeadsUrlMap(leadsFromProps);

                    const selectedConnectorDetails = connectorsList
                        .find(l => l.id === selectedConnector) || {};

                    return (
                        <ConnectorContent
                            filtersData={filtersData[selectedConnector]}
                            connectorId={selectedConnector}
                            filters={selectedConnectorDetails.filters}
                            projectId={projectId}
                            connectorLeads={leads}
                            leadsCount={count}
                            countPerPage={countPerPage}
                            activePage={activePage || 1}
                            onFiltersApply={this.handleFiltersApply}
                            className={styles.content}
                            setConnectorLeads={this.setConnectorLeads}
                            setConnectorActivePage={this.setConnectorActivePage}
                            selectedLeads={selectedLeads[selectedConnector]}
                            setConnectorLeadSelection={this.setConnectorLeadSelection}
                            onSelectAllClick={this.handleSelectAllLead}
                            leadsUrlMap={leadsUrlMap}
                        />
                    );
                },
                wrapContainer: true,
            };
            views[c.id] = view;
        });
        return views;
    })

    getFlatSelectedLeads = memoize((selectedLeads, leadsUrlMap) => {
        const leads = Object.values(selectedLeads).reduce(
            (acc, selectedLead) => ([
                ...acc,
                ...(selectedLead || []),
            ]),
            [],
        );
        const filteredLeads = leads.filter((l) => {
            if (!l.existing && !leadsUrlMap[l.url]) {
                return l;
            }
            return null;
        });
        return filteredLeads;
    })

    setConnectorLeads = ({
        leads,
        connectorId,
        totalCount,
        countPerPage,
    }) => {
        const settings = {
            connectorsLeads: { $auto: {
                [connectorId]: { $auto: {
                    leads: { $set: leads },
                    count: { $set: totalCount },
                    countPerPage: { $set: countPerPage },
                } },
            } },
        };
        this.setState(update(this.state, settings));
    }

    setConnectorActivePage = ({ connectorId, activePage }) => {
        const settings = {
            connectorsLeads: { $auto: {
                [connectorId]: { $auto: {
                    activePage: { $set: activePage },
                } },
            } },
        };
        this.setState(update(this.state, settings));
    }

    setConnectorLeadSelection = ({ key, isSelected, connectorId }) => {
        const {
            connectorsLeads: {
                [connectorId]: {
                    leads,
                } = {},
            },
            selectedLeads,
        } = this.state;

        const connectorLeadIndex = leads.findIndex(l => l.key === key);

        const selectedLeadsForIndex = selectedLeads[connectorId] || [];
        const selectedLeadsIndex = selectedLeadsForIndex.findIndex(l => l.key === key);

        const lead = leads[connectorLeadIndex];

        const settings = {
            connectorsLeads: { $auto: {
                [connectorId]: {
                    leads: {
                        [connectorLeadIndex]: {
                            isSelected: { $set: isSelected },
                        },
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

    setConnectorsList = (connectorsList) => {
        this.setState({
            connectorsList,
            selectedConnector: connectorsList[0] && connectorsList[0].id,
        });
    }

    handleFiltersApply = (value, connectorId) => {
        const settings = {
            filtersData: {
                [connectorId]: { $set: value },
            },
            connectorsLeads: { $auto: {
                [connectorId]: { $auto: {
                    activePage: { $set: 1 },
                } },
            } },
        };
        this.setState(update(this.state, settings));
    }

    handleSelectAllLead = ({ connectorId, isSelected }) => {
        const { connectorsLeads: {
            [connectorId]: {
                leads,
            } = {},
        } = {} } = this.state;

        if (leads.length > 0) {
            const part = leads.reduce(
                (acc, val, index) => ({
                    ...acc,
                    [index]: { isSelected: { $set: isSelected } },
                }),
                {},
            );
            const settings = {
                connectorsLeads: { $auto: {
                    [connectorId]: {
                        leads: part,
                    },
                } },
            };
            if (isSelected) {
                settings.selectedLeads = { $auto: {
                    [connectorId]: { $set: leads },
                } };
            } else {
                settings.selectedLeads = { $auto: {
                    [connectorId]: { $set: [] },
                } };
            }
            this.setState(update(this.state, settings));
        }
    }

    handleSearchInputChange = (searchInputValue) => {
        this.setState({ searchInputValue });
    };

    handleConnectorSelectModalClose = () => {
        this.props.closeModal();
    }

    handleLeadsSelect = () => {
        const {
            leads,
            onLeadsSelect,
            closeModal,
        } = this.props;

        const { selectedLeads: selectedLeadsFromState } = this.state;
        const leadsUrlMap = this.getLeadsUrlMap(leads);
        const selectedLeads = this.getFlatSelectedLeads(selectedLeadsFromState, leadsUrlMap);

        onLeadsSelect(selectedLeads);
        closeModal();
    }

    handleConnectorClick = (selectedConnector) => {
        this.setState({ selectedConnector });
    }

    connectorRendererParams = (key, data) => ({
        currentConnectorId: this.state.selectedConnector,
        connectorId: key,
        title: data.title,
        onConnectorClick: this.handleConnectorClick,
    })

    connectorGroupRendererParams = groupKey => ({
        children: groupKey,
    });

    renderSidebar = () => {
        const {
            searchInputValue,
            connectorsList,
        } = this.state;

        const displayConnectorsList = this.getListAfterSearch(connectorsList, searchInputValue);

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
                    keySelector={ConnectorSelectModal.connectorKeySelector}
                    groupRendererClassName={styles.group}
                    groupKeySelector={ConnectorSelectModal.connectorSourceSelector}
                    groupRendererParams={this.connectorGroupRendererParams}
                    rendererParams={this.connectorRendererParams}
                    renderer={ConnectorListItem}
                />
            </div>
        );
    }

    renderConnectorContent = () => {
        const {
            selectedConnector,
            connectorsList,
        } = this.state;

        if (connectorsList.length <= 0) {
            return (
                <Message className={styles.empty}>
                    { _ts('addLeads.connectorsSelect', 'noConnectorsLabel') }
                    <Link
                        className={styles.settingsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        to={reverseRoute(pathNames.connectors, { })}
                    >
                        <Icon name="settings" />
                    </Link>
                </Message>
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
        const {
            requests: {
                connectorsGetRequest: {
                    pending: dataLoading,
                },
            },
            leads,
        } = this.props;

        const {
            selectedLeads,
            connectorsList,
        } = this.state;

        const Sidebar = this.renderSidebar;
        const Content = this.renderConnectorContent;

        const leadsUrlMap = this.getLeadsUrlMap(leads);
        const isSelectionEmpty = this.getFlatSelectedLeads(selectedLeads, leadsUrlMap).length <= 0;

        this.views = this.getContentViews(connectorsList);

        return (
            <Modal className={styles.modal} >
                <ModalHeader
                    title={_ts('addLeads.connectorsSelect', 'connectorsLabel')}
                    rightComponent={
                        <div className={styles.rightButtons} >
                            <PrimaryButton
                                onClick={this.handleConnectorSelectModalClose}
                                transparent
                                iconName="close"
                            />
                        </div>
                    }
                />
                <ModalBody className={styles.modalBody} >
                    { dataLoading && <LoadingAnimation /> }
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
