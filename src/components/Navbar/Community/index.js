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

    handleZeClick = () => {
        if (window.zE) {
            window.zE.activate({ hideOnClose: true });
        }
    }

    render() {
        const {
            className,
        } = this.props;

        const slackLink = 'https://goo.gl/13pcuA';
        const skypeLink = 'https://join.skype.com/idYxL8ozLDOD';

        const slackLinkTitle = _ts('components.navbar', 'slackLinkTitle');
        const skypeLinkTitle = _ts('components.navbar', 'skypeLinkTitle');
        const zendeskLinkTitle = _ts('components.navbar', 'zendeskLinkTitle');

        const slackTitle = _ts('components.navbar', 'slackTitle');
        const skypeTitle = _ts('components.navbar', 'skypeTitle');
        const zendeskTitle = _ts('components.navbar', 'zendeskTitle');

        const iconClassName = `
            ${iconNames.chat}
            ${styles.icon}
        `;

        return (
            <DropdownMenu
                className={className}
                dropdownClassName={styles.communityDropdown}
                dropdownIcon={iconClassName}
                closeOnClick
            >
                <a
                    className={styles.joinLink}
                    href={slackLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={slackLinkTitle}
                >
                    <img
                        className={styles.image}
                        src={slackLogo}
                        alt=""
                    />
                    <div className={styles.title}>
                        {slackTitle}
                    </div>
                </a>
                <a
                    className={styles.joinLink}
                    href={skypeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={skypeLinkTitle}
                >
                    <img
                        className={styles.image}
                        alt=""
                        src={skypeLogo}
                    />
                    <div className={styles.title}>
                        {skypeTitle}
                    </div>
                </a>
                <button
                    className={`${styles.joinLink} ${styles.button}`}
                    onClick={this.handleZeClick}
                    title={zendeskLinkTitle}
                >
                    <img
                        className={styles.image}
                        alt=""
                        src={zendeskLogo}
                    />
                    <div className={styles.title}>
                        {zendeskTitle}
                    </div>
                </button>
            </DropdownMenu>
        );
    }
}
