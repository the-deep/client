import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import HighlightableTextOutput from '#newComponents/viewer/HighlightableTextOutput';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    itemKey: PropTypes.number.isRequired,
    logo: PropTypes.string,
    name: PropTypes.string,
    longName: PropTypes.string,
    shortName: PropTypes.string,
    searchValue: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    organizationType: PropTypes.object,
};

const defaultProps = {
    className: undefined,
    logo: undefined,
    longName: undefined,
    name: undefined,
    shortName: undefined,
    searchValue: undefined,
    organizationType: undefined,
};

const emptyObject = {};

export default class OrganizationItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleDragStart = (e) => {
        const {
            name,
            itemKey,
            logo,
        } = this.props;

        const data = JSON.stringify({
            organizationId: itemKey,
            organizationName: name,
            organizationLogo: logo,
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
            organizationType,
        } = this.props;

        const {
            title,
            description,
        } = organizationType || emptyObject;

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
                            title={`${title}\r\n\r\n${description}`}
                            className={styles.type}
                        >
                            { title }
                        </div>
                    ) }
                </div>
            </div>
        );
    }
}
