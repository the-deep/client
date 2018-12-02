import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    RequestCoordinator,
    RequestClient,
} from '#request';
import iconNames from '#constants/iconNames';
import { adminEndpoint } from '#config/rest';
import {
    setPagesInfoAction,
    pagesInfoSelector,
} from '#redux';

import _ts from '#ts';

import Cloak from '../../Cloak';

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

        return (
            // TODO: Styling
            <div className={className} >
                <a
                    href={meta.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={zendeskLinkRequest.pending}
                >
                    <span className={iconNames.help} />
                </a>
                <Cloak
                    hide={ZendeskHelpLink.shouldHideAdminLink}
                    render={
                        <a
                            href={
                                currentPageMeta ?
                                    createEditLink(currentPageMeta.id) : createAddLink(currentPath)
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            disabled={zendeskLinkRequest.pending}
                        >
                            {
                                currentPageMeta ?
                                    _ts('zendeskHelpLink', 'AdminEditLink')
                                    : _ts('zendeskHelpLink', 'AdminAddLink')
                            }
                        </a>
                    }
                />
            </div>
        );
    }
}
