import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import HighlightableTextOutput from '../../HighlightableTextOutput';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    itemKey: PropTypes.number.isRequired,
    logo: PropTypes.string,
    name: PropTypes.string,
    searchValue: PropTypes.string,
};

const defaultProps = {
    className: undefined,
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
        } = this.props;

        const data = JSON.stringify({
            organizationId: itemKey,
            organizationName: name,
        });

        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.dropEffect = 'copy';
    }

    render() {
        const {
            className,
            logo,
            name,
            longName,
            shortName,
            searchValue,
            type,
            organizationTypes,
        } = this.props;

        const organizationType = organizationTypes[type];

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
                    <HighlightableTextOutput
                        className={styles.name}
                        text={name}
                        highlightText={searchValue}
                    />
                    <HighlightableTextOutput
                        className={styles.abbr}
                        text={shortName}
                        highlightText={searchValue}
                    />
                    { organizationType && (
                        <div
                            title={`${organizationType.title}\r\n\r\n${organizationType.description}`}
                            className={styles.type}
                        >
                            { organizationType.title }
                        </div>
                    ) }
                </div>
            </div>
        );
    }
}
