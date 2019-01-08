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
    helpLinkRequest: PropTypes.object.isRequired,
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
    helpLinkRequest: {
        schemaName: 'pageInfoRequest',
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
export default class HelpLink extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHideAdminLink = ({ isAdmin }) => !isAdmin;

    render() {
        const {
            className: classNameFromProps,
            currentPath,
            helpLinkRequest,
            pagesInfo,
        } = this.props;

        const currentPageMeta = pagesInfo[currentPath];
        const meta = (
            currentPageMeta || pagesInfo.default || emptyObject
        );

        const iconClassName = `
            ${styles.icon}
            ${iconNames.helpOutlined}
        `;

        const className = `
            ${classNameFromProps}
            ${styles.helpLinkContainer}
        `;

        const addOrEditIconClassName = `
            ${currentPageMeta ? iconNames.edit : iconNames.add}
            ${styles.addOrEditIcon}
        `;

        return (
            <div className={className}>
                <a
                    href={meta.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={helpLinkRequest.pending}
                    title={meta.title}
                    className={styles.helpLink}
                >
                    <span className={iconClassName} />
                    <div className={styles.content} >
                        <div
                            className={styles.text}
                            title={meta.title}
                        >
                            {meta.title || _ts('components.navbar', 'helpTitle')}
                        </div>
                    </div>
                </a>
                <Cloak
                    hide={HelpLink.shouldHideAdminLink}
                    render={
                        <a
                            href={
                                currentPageMeta ?
                                    createEditLink(currentPageMeta.id) :
                                    createAddLink(currentPath)
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            disabled={helpLinkRequest.pending}
                            className={styles.addOrEditHelpLink}
                            title={_ts('components.navbar', 'addOrEditHelpLinkTitle')}
                        >
                            <span className={addOrEditIconClassName} />
                        </a>
                    }
                />
            </div>
        );
    }
}
