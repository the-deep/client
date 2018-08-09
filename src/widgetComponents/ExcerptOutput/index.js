import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const TEXT = 'text';
const IMAGE = 'image';

const propTypes = {
    className: PropTypes.string,

    type: PropTypes.oneOf([
        TEXT,
        IMAGE,
    ]),

    value: PropTypes.string,
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

        let Children;
        switch (type) {
            case TEXT: {
                Children = (
                    <p className={styles.text}>
                        { value }
                    </p>
                );
                break;
            }
            case IMAGE: {
                Children = (
                    <img
                        className={styles.image}
                        alt=""
                        src={value}
                    />
                );
                break;
            }
            default:
                console.error('Excerpt should either be image or text');
                break;
        }

        return (
            <div className={className}>
                <Children />
            </div>
        );
    }
}
