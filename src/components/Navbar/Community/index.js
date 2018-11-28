import PropTypes from 'prop-types';
import React from 'react';

import DropdownMenu from '#rsca/DropdownMenu';

import { iconNames } from '#constants';
import _ts from '#ts';

import slackLogo from '#resources/img/slack.png';
import skypeLogo from '#resources/img/skype.png';
import zendeskLogo from '#resources/img/zendesk.png';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class Community extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
        } = this.props;

        const slackLink = 'https://goo.gl/13pcuA';
        const skypeLink = 'https://join.skype.com/idYxL8ozLDOD';
        const zendeskLink = 'https://deephelp.zendesk.com/hc/en-us/categories/360000874911-DEEP-User-Guide';
        const slackLinkTitle = _ts('components.navbar', 'slackLinkTitle');
        const skypeLinkTitle = _ts('components.navbar', 'skypeLinkTitle');
        const zendeskLinkTitle = _ts('components.navbar', 'zendeskLinkTitle');
        const slackTitle = _ts('components.navbar', 'slackTitle');
        const skypeTitle = _ts('components.navbar', 'skypeTitle');
        const zendeskTitle = _ts('components.navbar', 'zendeskTitle');

        return (
            <DropdownMenu
                className={className}
                dropdownClassName={styles.userDropdown}
                dropdownIcon={iconNames.chat}
            >
                <a
                    className={styles.joinLink}
                    href={slackLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        className={styles.image}
                        src={slackLogo}
                        alt=""
                        title={slackLinkTitle}
                    />
                    <p>{slackTitle}</p>
                </a>
                <a
                    className={styles.joinLink}
                    href={skypeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        className={styles.image}
                        title={skypeLinkTitle}
                        alt=""
                        src={skypeLogo}
                    />
                    <p>{skypeTitle}</p>
                </a>
                <a
                    className={styles.joinLink}
                    href={zendeskLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        className={styles.image}
                        title={zendeskLinkTitle}
                        alt=""
                        src={zendeskLogo}
                    />
                    <p>{zendeskTitle}</p>
                </a>
            </DropdownMenu>
        );
    }
}
