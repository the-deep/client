import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';
import iconNames from '#constants/iconNames';
import { adminEndpoint } from '#config/rest';
import {
    setPagesInfoAction,
    pagesInfoSelector,
} from '#redux';

import _ts from '#ts';

import Cloak from '../../Cloak';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    currentPath: PropTypes.string.isRequired,
    pagesInfo: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    // Requests Props
    // eslint-disable-next-line react/forbid-prop-types
    zendeskLinkRequest: PropTypes.object.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    pagesInfo: pagesInfoSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setPagesInfo: params => dispatch(setPagesInfoAction(params)),
});

const requests = {
    zendeskLinkRequest: {
        // TODO: Define this schema
        schema: 'zendeskLinkGetRequest',
        method: requestMethods.GET,
        onMount: true,
        url: '/pages/',
        onSuccess: ({ props: { setPagesInfo }, response }) => {
            setPagesInfo({
                pagesInfo: response.results,
            });
        },
    },
};

const emptyObject = {};

const createEditLink = pageInfoId =>
    `${adminEndpoint}client_page_meta/page/${pageInfoId}/change/`;
const createAddLink = currentPath =>
    `${adminEndpoint}client_page_meta/page/add/?page_id=${currentPath}`;

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requests)
export default class ZendeskHelpLink extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHideAdminLink = ({ isAdmin }) => !isAdmin;

    render() {
        const {
            className,
            currentPath,
            zendeskLinkRequest,
            pagesInfo,
        } = this.props;

        const currentPageMeta = pagesInfo[currentPath];
        const meta = (
            currentPageMeta || pagesInfo.default || emptyObject
        );

        const iconClassName = `
            ${styles.icon}
            ${iconNames.help}
        `;

        return (
            <div className={styles.zenHelp} >
                <a
                    href={meta.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={zendeskLinkRequest.pending}
                    className={styles.helpLink}
                >
                    <i className={iconClassName} />
                    <span className={styles.content} >
                        <span
                            className={styles.text}
                            title={meta.title}
                        >
                            {meta.title}
                        </span>
                        <Cloak
                            hide={ZendeskHelpLink.shouldHideAdminLink}
                            render={
                                <a
                                    href={
                                        currentPageMeta ?
                                            createEditLink(currentPageMeta.id) :
                                            createAddLink(currentPath)
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    disabled={zendeskLinkRequest.pending}
                                    className={styles.admin}
                                >
                                    {
                                        currentPageMeta ?
                                            <span className={iconNames.edit} />
                                            : <span className={iconNames.add} />
                                    }
                                </a>
                            }
                        />
                    </span>
                </a>
            </div>
        );
    }
}
