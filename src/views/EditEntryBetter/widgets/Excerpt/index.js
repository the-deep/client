import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import TextArea from '#rsci/TextArea';
import AccentButton from '#rs/components/Action/Button/AccentButton';
import { formatPdfText } from '#rs/utils/common';

import { iconNames } from '#constants';
import _ts from '#ts';

import DropContainer from './DropContainer';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    entryType: PropTypes.string,
    excerpt: PropTypes.string,
    image: PropTypes.string,
    onExcerptChange: PropTypes.func.isRequired,
    onExcerptCreate: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    entryType: undefined,
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

    handleExcerptChange = (type, value, createMode = false) => {
        const { onExcerptChange, onExcerptCreate } = this.props;
        if (createMode) {
            onExcerptCreate({
                type,
                value,
            });
        } else {
            onExcerptChange({
                type,
                value,
            });
        }
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

    handleFormatText = () => {
        const { excerpt } = this.props;
        this.handleTextChange(formatPdfText(excerpt));
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
                data: transferredData,
            };
        }

        const {
            type,
            data,
        } = formattedData;

        const {
            entryType,
            image,
            excerpt,
        } = this.props;

        const hasExcerpt = (entryType === IMAGE && image) || (entryType === TEXT && excerpt);
        if (hasExcerpt) {
            // create new entry if entry has excerpt
            this.handleExcerptChange(type, data, true);
        } else {
            this.handleExcerptChange(type, data, false);
        }

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

        const buttonTitle = _ts('framework.excerptWidget', 'formatExcerpt');

        return (
            <Fragment>
                <TextArea
                    className={className}
                    showLabel={false}
                    showHintAndError={false}
                    value={excerpt}
                    onChange={this.handleTextChange}
                />
                <AccentButton
                    tabIndex="-1"
                    className={styles.formatButton}
                    iconName={iconNames.textFormat}
                    onClick={this.handleFormatText}
                    title={buttonTitle}
                    smallVerticalPadding
                    smallHorizontalPadding
                    transparent
                />
            </Fragment>
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
