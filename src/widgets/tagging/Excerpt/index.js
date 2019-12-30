import React from 'react';
import PropTypes from 'prop-types';

import FormattedTextArea from '#rsci/FormattedTextArea';
import Button from '#rsca/Button';

import DataSeries from '#components/viz/DataSeries';
import Cloak from '#components/general/Cloak';
import Image from '#rscv/Image';
import _ts from '#ts';

import DropContainer from './DropContainer';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    entryType: PropTypes.string,
    excerpt: PropTypes.string,
    image: PropTypes.string,
    tabularField: PropTypes.number,
    tabularFieldData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onExcerptChange: PropTypes.func,
    onHighlightHiddenChange: PropTypes.func,
    onExcerptCreate: PropTypes.func,
    onExcerptReset: PropTypes.func,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    highlightHidden: PropTypes.bool,
};

const defaultProps = {
    className: '',
    entryType: undefined,
    excerpt: undefined,
    image: undefined,
    tabularField: undefined,
    tabularFieldData: undefined,
    disabled: false,
    readOnly: false,
    onExcerptChange: () => {},
    onExcerptCreate: () => {},
    onExcerptReset: () => {},
    onHighlightHiddenChange: () => {},
    highlightHidden: false,
};

// FIXME: reuse this from entities.editEntries
const TEXT = 'excerpt';
const IMAGE = 'image';
const DATA_SERIES = 'dataSeries';

export default class Excerpt extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHideZoomable = ({ accessZoomableImage }) => !accessZoomableImage;

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
            tabularField,
            onExcerptChange,
            onExcerptCreate,
        } = this.props;

        const hasEntry = !!entryType;
        const hasExcerpt =
            (entryType === IMAGE && !!image) ||
            (entryType === TEXT && !!excerpt) ||
            (entryType === DATA_SERIES && !!tabularField);

        if (!hasEntry || hasExcerpt) {
            onExcerptCreate({
                type,
                value: data,
                dropped: true,
            });
        } else {
            onExcerptChange({
                type,
                value: data,
            });
        }

        this.setState({ isBeingDraggedOver: false });
    }

    handleReset = () => {
        const {
            onExcerptReset,
        } = this.props;
        onExcerptReset({ type: TEXT });
    }

    handleEntryStateChange = (value) => {
        const {
            onEntryStateChange,
            entryState,
            entryKey,
        } = this.props;
        onEntryStateChange(entryKey, value);
    }

    handleHighlightHiddenChange = () => {
        const {
            onHighlightHiddenChange,
            highlightHidden,
        } = this.props;

        onHighlightHiddenChange(!highlightHidden);
    }

    renderExcerptImage = () => {
        const { image } = this.props;

        const className = `
            ${styles.image}
            image
        `;

        return (
            <Cloak
                hide={Excerpt.shouldHideZoomable}
                render={
                    <Image
                        className={className}
                        src={image}
                        alt={_ts('widgets.tagging.excerpt', 'imageAltText')}
                        zoomable
                    />
                }
                renderOnHide={
                    <img
                        className={`${className} ${styles.imageAlt}`}
                        src={image}
                        alt={_ts('widgets.tagging.excerpt', 'imageAltText')}
                    />
                }
            />
        );
    }

    renderDataSeries = () => {
        const {
            tabularFieldData,
            entryState,
        } = this.props;
        const className = `
            ${styles.dataSeries}
            data-series
        `;

        return (
            <DataSeries
                className={className}
                value={tabularFieldData}
                onEntryStateChange={this.handleEntryStateChange}
                entryState={entryState}
            />
        );
    }

    renderText = () => {
        const {
            entryType,
            excerpt,
            droppedExcerpt,
            disabled,
            readOnly,
            highlightHidden,
        } = this.props;

        const className = `
            ${styles.text}
            text
        `;

        return (
            <>
                { droppedExcerpt && (
                    <Button
                        transparent
                        onClick={this.handleHighlightHiddenChange}
                    >
                        {/* FIXME: use strings */}
                        { highlightHidden ? 'Show highlight' : 'Hide highlight' }
                    </Button>
                )}
                { droppedExcerpt && droppedExcerpt !== excerpt && (
                    <Button
                        transparent
                        onClick={this.handleReset}
                    >
                        {/* FIXME: use strings */}
                        Reset Excerpt
                    </Button>
                )}
                <FormattedTextArea
                    className={className}
                    showLabel={false}
                    value={excerpt}
                    onChange={this.handleTextChange}
                    disabled={disabled}
                    readOnly={readOnly}
                    showFormatButton={!!entryType}
                />
            </>
        );
    }

    render() {
        const {
            className: classNameFromProps,
            entryType,
        } = this.props;
        const { isBeingDraggedOver } = this.state;

        const ExcerptImage = this.renderExcerptImage;
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
                    (entryType === IMAGE && <ExcerptImage />) ||
                    (entryType === TEXT && <Text />) ||
                    (entryType === DATA_SERIES && <DataSeriesInternal />)
                ) }
            </div>
        );
    }
}
