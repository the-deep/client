import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import HighlightableTextOutput from '../../HighlightableTextOutput';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    isDonor: PropTypes.bool,
    itemKey: PropTypes.number.isRequired,
    logo: PropTypes.string,
    name: PropTypes.string,
    searchValue: PropTypes.string,
};

const defaultProps = {
    className: undefined,
    isDonor: false,
    logo: undefined,
    name: undefined,
    searchValue: undefined,
};

// FIXME: Use strings everywhere, define all the props
// FIXME: No inline functions

export default class OrganizationItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleDragStart = (e) => {
        const {
            name,
            itemKey,
            isDonor,
        } = this.props;

        const data = JSON.stringify({
            organizationId: itemKey,
            isDonor,
            organizationName: name,
        });

        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.dropEffect = 'copy';
    }

    render() {
        const {
            className,
            isDonor,
            logo,
            name,
            longName,
            shortName,
            searchValue,
        } = this.props;

        return (
            <div
                title={longName}
                className={_cs(styles.organizationItem, className)}
                draggable
                onDragStart={this.handleDragStart}
            >
                <div className={styles.logo}>
                    { logo ? (
                        <img
                            className={styles.image}
                            src={logo}
                            alt={name}
                        />
                    ) : (
                        <Icon
                            className={styles.icon}
                            name="people"
                        />
                    )}
                </div>
                <div className={styles.text}>
                    <div className={styles.top}>
                        <HighlightableTextOutput
                            className={styles.name}
                            text={name}
                            highlightText={searchValue}
                        />
                    </div>
                    <div className={styles.bottom}>
                        <HighlightableTextOutput
                            className={styles.abbr}
                            text={shortName}
                            highlightText={searchValue}
                        />
                        { isDonor && (
                            <div className={styles.donorFlag}>
                                Donor
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
