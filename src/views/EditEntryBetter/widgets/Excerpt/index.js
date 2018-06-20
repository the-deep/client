import React from 'react';
import PropTypes from 'prop-types';

import TextArea from '#rsci/TextArea';

import DropContainer from './DropContainer';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    entryType: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    image: PropTypes.string,
    onExcerptChange: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    excerpt: undefined,
    image: undefined,
};

const TEXT = 'excerpt';
const IMAGE = 'image';

export default class Excerpt extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = { isBeingDraggedOver: false };
    }

    handleExcerptChange = (type, value) => {
        const { onExcerptChange } = this.props;
        onExcerptChange({
            type,
            value,
        });
    }

    handleDragEnter = () => {
        this.setState({ isBeingDraggedOver: true });
    }

    handleDragOver = (e) => {
        e.preventDefault();
    }

    handleDragExit = () => {
        this.setState({ isBeingDraggedOver: false });
    }

    handleTextChange = (value) => {
        this.handleExcerptChange(TEXT, value);
    }

    handleDragDrop = (e) => {
        e.preventDefault();
        const transferredData = e.dataTransfer.getData('text');
        let formattedData;

        try {
            formattedData = JSON.parse(transferredData);
        } catch (ex) {
            formattedData = {
                type: TEXT,
                transferredData,
            };
        }

        const {
            type,
            data,
        } = formattedData;

        this.handleExcerptChange(type, data);

        this.setState({ isBeingDraggedOver: false });
    }

    renderImage = () => {
        const {
            entryType,
            image,
        } = this.props;

        const { isBeingDraggedOver } = this.state;

        if (isBeingDraggedOver || entryType !== IMAGE) {
            return null;
        }

        const className = `
            ${styles.image}
            image 
        `;

        // FIXME: use translation
        const altText = 'Excerpt image';
        return (
            <img
                className={className}
                src={image}
                alt={altText}
            />
        );
    }

    renderText = () => {
        const {
            entryType,
            excerpt,
        } = this.props;

        const { isBeingDraggedOver } = this.state;

        if (isBeingDraggedOver || entryType !== TEXT) {
            return null;
        }

        const className = `
            ${styles.text}
            text
        `;

        return (
            <TextArea
                className={className}
                showLabel={false}
                showHintAndError={false}
                value={excerpt}
                onChange={this.handleTextChange}
            />
        );
    }

    render() {
        const { className: classNameFromProps } = this.props;
        const { isBeingDraggedOver } = this.state;

        const Image = this.renderImage;
        const Text = this.renderText;

        const className = `
            ${classNameFromProps}
            ${styles.excerpt}
            excerpt
        `;

        return (
            <div
                className={className}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragExit}
                onDragOver={this.handleDragOver}
                onDrop={this.handleDragDrop}
            >
                <DropContainer show={isBeingDraggedOver} />
                <Text />
                <Image />
            </div>
        );
    }
}
