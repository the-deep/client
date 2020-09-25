import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import TextInput from '#rsci/TextInput';
import Icon from '#rscg/Icon';

import _ts from '#ts';

import styles from './styles.scss';

function Bar(props) {
    const {
        url,
        children,
    } = props;

    const className = _cs(
        styles.urlbar,
        'urlbar',
    );

    return (
        <div className={className}>
            <TextInput
                className={styles.url}
                value={url}
                readOnly
                showLabel={false}
                showHintAndError={false}
                selectOnFocus
            />
            <div className={styles.actionButtons}>
                <a
                    className={styles.openLink}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={_ts('components.galleryViewer', 'viewLinkTooltip')} // open link in new tab
                >
                    <Icon name="openLink" />
                </a>
                {children}
            </div>
        </div>
    );
}
Bar.propTypes = {
    url: PropTypes.string,
    children: PropTypes.node,
};
Bar.defaultProps = {
    url: '',
    children: undefined,
};

export default Bar;
