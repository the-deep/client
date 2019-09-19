import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { connect } from 'react-redux';
import { getFiltersForRequest } from '#entities/lead';
import modalize from '#rscg/Modalize';
import Spinner from '#rscv/Spinner';
import AccentButton from '#rsca/Button/AccentButton';
import EmmStatsModal from '#components/viewer/EmmStatsModal';
import {
    activeProjectIdFromStateSelector,
    leadPageFilterSelector,
} from '#redux';
import {
    RequestClient,
    requestMethods,
} from '#request';

import _ts from '#ts';

import styles from './styles.scss';

const ModalButton = modalize(AccentButton);

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    emmStatusRequest: PropTypes.object.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    filters: leadPageFilterSelector(state),
});

const requests = {
    emmStatusRequest: {
        url: '/leads/emm-summary/',
        method: requestMethods.POST,
        onMount: true,
        body: ({
            props: {
                activeProject,
                filters,
            },
        }) => ({
            project: [activeProject],
            ...getFiltersForRequest(filters),
        }),
        onPropsChanged: [
            'activeProject',
            'filters',
        ],
        onSuccess: ({
            response: {
                emmEntities,
                emmTriggers,
            },
            params: {
                onEmmStatsGet,
            },
        }) => {
            const emmTriggersWithCount = emmTriggers.map(t => ({
                ...t,
                count: t.totalCount,
            }));

            const emmEntitiesWithCount = emmEntities.map(e => ({
                ...e,
                count: e.totalCount,
            }));

            onEmmStatsGet(emmEntitiesWithCount, emmTriggersWithCount);
        },
        schemaName: 'emmSummary',
    },
};

@connect(mapStateToProps)
@RequestClient(requests)
export default class EmmStatsBar extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { emmStatusRequest } = this.props;
        emmStatusRequest.setDefaultParams({
            onEmmStatsGet: this.handleEmmStatsSet,
        });

        this.state = {
            emmEntities: [],
            emmTriggers: [],
        };
    }

    handleEmmStatsSet = (emmEntities, emmTriggers) => {
        this.setState({
            emmEntities,
            emmTriggers,
        });
    }

    render() {
        const {
            className,
            emmStatusRequest: {
                pending,
            },
        } = this.props;

        const {
            emmEntities,
            emmTriggers,
        } = this.state;

        const entitiesCount = emmEntities.length;
        const triggersCount = emmTriggers.length;

        return (
            <div className={_cs(styles.emmStatusBar, className)} >
                {pending && <Spinner />}
                <ModalButton
                    className={styles.button}
                    transparent
                    modal={
                        <EmmStatsModal
                            emmTriggers={emmTriggers}
                            emmEntities={emmEntities}
                        />
                    }
                >
                    {_ts(
                        'leads',
                        'emmCountButtonLabel',
                        {
                            entitiesCount,
                            triggersCount,
                        },
                    )}
                </ModalButton>
            </div>
        );
    }
}
