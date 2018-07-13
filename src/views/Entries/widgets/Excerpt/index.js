import React from 'react';
import PropTypes from 'prop-types';

import ExcerptOutput from '#widgetComponents/ExcerptOutput';

const propTypes = {
    className: PropTypes.string,
    entryType: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    image: PropTypes.string,
};

const defaultProps = {
    className: '',
    excerpt: '',
    image: '',
};

const TEXT = 'excerpt';
const IMAGE = 'image';

const entryTypes = {
    excerpt: 'text',
    image: 'image',
};

export default class ExcerptWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            entryType,
            excerpt,
            image,
        } = this.props;

        let value;
        switch (entryType) {
            case TEXT:
                value = excerpt;
                break;
            case IMAGE:
                value = image;
                break;
            default:
                console.error('Unknown entry type', entryType);
        }

        return (
            <ExcerptOutput
                className={className}
                type={entryTypes[entryType]}
                value={value}
            />
        );
    }
}
