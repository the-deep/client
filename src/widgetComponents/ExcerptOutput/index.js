import PropTypes from 'prop-types';
import React from 'react';
import DataSeries from '#components/DataSeries';

import styles from './styles.scss';

const TEXT = 'text';
const IMAGE = 'image';
const DATA_SERIES = 'dataSeries';

const propTypes = {
    className: PropTypes.string,

    type: PropTypes.oneOf([
        TEXT,
        IMAGE,
        DATA_SERIES,
    ]),

    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
};

const defaultProps = {
    className: '',
    type: TEXT,
    value: '',
};

export default class ExcerptOutput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            type,
            value,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.excerpt}
        `;

        let children;
        switch (type) {
            case TEXT: {
                children = (
                    <p className={styles.text}>
                        { value }
                    </p>
                );
                break;
            }
            case IMAGE: {
                children = (
                    <img
                        className={styles.image}
                        alt=""
                        src={value}
                    />
                );
                break;
            }
            case DATA_SERIES:
                children = (
                    <DataSeries
                        className={styles.dataSeries}
                        value={value}
                    />
                );
                break;
            default:
                console.error('Excerpt should either be image or text');
                break;
        }

        return (
            <div className={className}>
                {children}
            </div>
        );
    }
}
