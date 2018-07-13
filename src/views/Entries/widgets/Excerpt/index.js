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
// const IMAGE = 'image';

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

        const value = entryType === TEXT ? excerpt : image;

        return (
            <ExcerptOutput
                className={className}
                type={entryTypes[entryType]}
                value={value}
            />
        );
    }
}
