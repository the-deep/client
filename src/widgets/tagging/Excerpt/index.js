import React from 'react';
import PropTypes from 'prop-types';

import FormattedTextArea from '#rsci/FormattedTextArea';

import DataSeries from '#components/DataSeries';
import _ts from '#ts';

import DropContainer from './DropContainer';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    entryType: PropTypes.string,
    excerpt: PropTypes.string,
    image: PropTypes.string,
    dataSeries: PropTypes.shape({}),
    onExcerptChange: PropTypes.func,
    onExcerptCreate: PropTypes.func,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    className: '',
    entryType: undefined,
    excerpt: undefined,
    image: undefined,
    dataSeries: undefined,
    disabled: false,
    readOnly: false,
    onExcerptChange: () => {},
    onExcerptCreate: () => {},
};

// FIXME: reuse this from entities.editEntries
const TEXT = 'excerpt';
const IMAGE = 'image';
const DATA_SERIES = 'dataSeries';

export default class Excerpt extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = { isBeingDraggedOver: false };
    }

    handleDragEnter = () => {
        if (this.props.disabled || this.props.readOnly) {
            return;
        }

        this.setState({ isBeingDraggedOver: true });
    }

    handleDragExit = () => {
        // Don't disable

        this.setState({ isBeingDraggedOver: false });
    }

    handleDragOver = (e) => {
        e.preventDefault();
    }

    handleTextChange = (value) => {
        const type = TEXT;
        const {
            entryType,
            onExcerptChange,
            onExcerptCreate,
        } = this.props;

        const hasEntry = !!entryType;

        if (!hasEntry) {
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

    handleDragDrop = (e) => {
        e.preventDefault();

        if (this.props.disabled || this.props.readOnly) {
            return;
        }

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
            dataSeries,
            onExcerptChange,
            onExcerptCreate,
        } = this.props;

        const hasEntry = !!entryType;
        const hasExcerpt =
            (entryType === IMAGE && !!image) ||
            (entryType === TEXT && !!excerpt) ||
            (entryType === DATA_SERIES && !!dataSeries);

        if (!hasEntry || hasExcerpt) {
            onExcerptCreate({
                type,
                value: data,
            });
        } else {
            onExcerptChange({
                type,
                value: data,
            });
        }

        this.setState({ isBeingDraggedOver: false });
    }

    renderImage = () => {
        const { image } = this.props;

        const className = `
            ${styles.image}
            image
        `;

        return (
            <img
                className={className}
                src={image}
                alt={_ts('widgets.tagging.excerpt', 'imageAltText')}
            />
        );
    }

    renderDataSeries = () => {
        const { dataSeries } = this.props;
        const className = `
            ${styles.dataSeries}
            dataSeries
        `;

        return (
            <DataSeries
                className={className}
                value={dataSeries}
            />
        );
    }

    renderText = () => {
        const {
            entryType,
            excerpt,
            disabled,
            readOnly,
        } = this.props;

        const className = `
            ${styles.text}
            text
        `;

        return (
            <FormattedTextArea
                className={className}
                showLabel={false}
                value={excerpt}
                onChange={this.handleTextChange}
                disabled={disabled}
                readOnly={readOnly}
                showFormatButton={!!entryType}
            />
        );
    }

    render() {
        const {
            className: classNameFromProps,
            entryType,
        } = this.props;
        const { isBeingDraggedOver } = this.state;

        const Image = this.renderImage;
        const Text = this.renderText;
        const DataSeriesInternal = this.renderDataSeries;

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
                { !isBeingDraggedOver && (
                    (entryType === IMAGE && <Image />) ||
                    (entryType === TEXT && <Text />) ||
                    (entryType === DATA_SERIES && <DataSeriesInternal />)
                ) }
            </div>
        );
    }
}
