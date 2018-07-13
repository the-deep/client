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

    renderText = () => {
        const {
            value,
            type,
        } = this.props;

        if (type !== TEXT) {
            return null;
        }

        return (
            <p className={styles.text}>
                { value }
            </p>
        );
    }

    renderImage = () => {
        const {
            value,
            type,
        } = this.props;

        if (type !== IMAGE) {
            return null;
        }

        return (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
                className={styles.image}
                src={value}
            />
        );
    }

    render() {
        const { className: classNameFromProps } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.excerpt}
        `;

        const Text = this.renderText;
        const Image = this.renderImage;

        return (
            <div className={className}>
                <Text />
                <Image />
            </div>
        );
    }
}
