import React from 'react';
import PropTypes from 'prop-types';

import ExcerptOutput from '#widgetComponents/ExcerptOutput';

const propTypes = {
    className: PropTypes.string,
    entryType: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    image: PropTypes.string,
    dataSeries: PropTypes.shape({}),
};

const defaultProps = {
    className: '',
    excerpt: '',
    image: '',
    dataSeries: undefined,
};

const TEXT = 'excerpt';
const IMAGE = 'image';
const DATA_SERIES = 'dataSeries';

const entryTypes = {
    excerpt: 'text',
    image: 'image',
    dataSeries: 'dataSeries',
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
            dataSeries,
        } = this.props;

        let value;
        switch (entryType) {
            case TEXT:
                value = excerpt;
                break;
            case IMAGE:
                value = image;
                break;
            case DATA_SERIES:
                value = dataSeries;
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
