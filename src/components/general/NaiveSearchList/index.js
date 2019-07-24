import PropTypes from 'prop-types';
import React from 'react';
import { _cs, isTruthyString } from '@togglecorp/fujs';

import SearchInput from '#rsci/SearchInput';
import FloatingContainer from '#rscv/FloatingContainer';
import ListView from '#rscv/List/ListView';

import {
    calcFloatPositionInMainWindow,
    defaultOffset,
    defaultLimit,
} from '#rsu/bounds';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    searchText: PropTypes.string,
    onSearchChange: PropTypes.func,
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    listKeySelector: PropTypes.func,
    listRenderer: PropTypes.func.isRequired,
    listRendererParams: PropTypes.func.isRequired,
    pending: PropTypes.bool,
    changeDelay: PropTypes.number,
};

const defaultProps = {
    changeDelay: undefined,
    className: '',
    searchText: '',
    onSearchChange: () => {},
    listKeySelector: d => d.id,
    data: [],
    pending: false,
};

export default class NaiveSearchList extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
        this.inputRef = React.createRef();
        this.state = { showOptionsPopup: false };
    }

    componentDidMount() {
        const { current: container } = this.containerRef;
        if (container) {
            this.boundingClientRect = container.getBoundingClientRect();
        }
    }

    handleInputFocus = () => {
        this.setState({ showOptionsPopup: true });
    }

    handleFloatingMouseDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const { current: input } = this.inputRef;
        if (input) {
            input.focus();
        }
    }

    handleSearchListBlur = () => {
        this.setState({ showOptionsPopup: false });
    }

    handleOptionsInvalidate = (optionsContainer) => {
        const contentRect = optionsContainer.getBoundingClientRect();
        let parentRect = this.boundingClientRect;
        const { current: container } = this.containerRef;

        if (container) {
            parentRect = container.getBoundingClientRect();
        }

        const offset = { ...defaultOffset };

        const limit = {
            ...defaultLimit,
            minW: parentRect.width,
            maxW: parentRect.width,
        };

        const optionsContainerPosition = (
            calcFloatPositionInMainWindow({
                parentRect,
                contentRect,
                offset,
                limit,
            })
        );

        return optionsContainerPosition;
    };

    render() {
        const {
            className,
            data,
            listKeySelector,
            listRenderer,
            listRendererParams,
            searchText,
            onSearchChange,
            changeDelay,
            pending: searchPending,
            ...otherProps
        } = this.props;

        const { showOptionsPopup } = this.state;

        const { current: container } = this.containerRef;
        const showList = isTruthyString(searchText);

        return (
            <div
                ref={this.containerRef}
                className={_cs(className, styles.naiveSearchList)}
            >
                <SearchInput
                    elementRef={this.inputRef}
                    className={styles.searchInput}
                    placeholder={_ts('components.naiveSearchList', 'searchInputPlaceholder')}
                    showLabel={false}
                    value={searchText}
                    onChange={onSearchChange}
                    showHintAndError={false}
                    onClick={this.handleInputFocus}
                    onFocus={this.handleInputFocus}
                    onBlur={this.handleSearchListBlur}
                    changeDelay={changeDelay}
                />
                {showOptionsPopup &&
                    <FloatingContainer
                        onInvalidate={this.handleOptionsInvalidate}
                        onBlur={this.handleSearchListBlur}
                        onMouseDown={this.handleFloatingMouseDown}
                        parent={container}
                    >
                        <ListView
                            className={styles.list}
                            data={data}
                            pending={searchPending}
                            renderer={listRenderer}
                            rendererParams={listRendererParams}
                            keySelector={listKeySelector}
                            isFiltered={showList}
                            {...otherProps}
                        />
                    </FloatingContainer>
                }
            </div>
        );
    }
}
