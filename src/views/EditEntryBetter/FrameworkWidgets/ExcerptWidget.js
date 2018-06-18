import React from 'react';
import PropTypes from 'prop-types';

import TextArea from '#rs/components/Input/TextArea';

const propTypes = {
    entryType: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    image: PropTypes.string,
};

const defaultProps = {
    excerpt: undefined,
    image: undefined,
};

export default class ExcerptWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            entryType,
            excerpt,
            image,
        } = this.props;

        const alt = 'Excerpt image';

        return (
            <div>
                {
                    entryType === 'image' ? (
                        <img
                            src={image}
                            alt={alt}
                        />
                    ) : (
                        <TextArea
                            showHintAndError={false}
                            value={excerpt}
                        />
                    )
                }
            </div>
        );
    }
}
