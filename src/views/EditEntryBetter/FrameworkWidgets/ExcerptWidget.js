import React from 'react';
import PropTypes from 'prop-types';

import TextArea from '#rs/components/Input/TextArea';

const propTypes = {
    entryType: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    image: PropTypes.string,
    onExcerptChange: PropTypes.func.isRequired,
};

const defaultProps = {
    excerpt: undefined,
    image: undefined,
};

export default class ExcerptWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleExcerptChange = (value) => {
        const { entryType } = this.props;
        if (entryType === 'excerpt') {
            this.props.onExcerptChange({
                entryType,
                excerpt: value,
            });
        }
    }

    render() {
        const {
            entryType,
            excerpt,
            image,
        } = this.props;

        // FIXME: use translation
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
                            showLabel={false}
                            value={excerpt}
                            onChange={this.handleExcerptChange}
                        />
                    )
                }
            </div>
        );
    }
}
