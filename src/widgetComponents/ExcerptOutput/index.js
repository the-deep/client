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
        } = this.props;

        return (
            <p className={styles.text}>
                { value }
            </p>
        );
    }

    renderImage = () => {
        const {
            value,
        } = this.props;

        return (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
                className={styles.image}
                src={value}
            />
        );
    }

    renderUnknown = () => (
        // FIXME: use strings
        <div className={styles.unknown}>
            Unknown type
        </div>
    )

    render() {
        const {
            className: classNameFromProps,
            type,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.excerpt}
        `;

        let Children;
        switch (type) {
            case TEXT:
                Children = this.renderText;
                break;
            case IMAGE:
                Children = this.renderImage;
                break;
            default:
                Children = this.renderUnknown;
        }

        return (
            <div className={className}>
                <Children />
            </div>
        );
    }
}
