import PropTypes from 'prop-types';
import React from 'react';
import { isTruthyString } from '@togglecorp/fujs';

import TextInput from '#rsci/TextInput';
import _ts from '#ts';
import FloatingContainer from '#rscv/FloatingContainer';
import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    calcFloatPositionInMainWindow,
    defaultOffset,
    defaultLimit,
} from '#rsu/bounds';

import styles from './styles.scss';

const propTypes = {
    searchText: PropTypes.string,
    onSearchChange: PropTypes.func,
    list: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    listKeySelector: PropTypes.func,
    listRenderer: PropTypes.func.isRequired,
    listRendererParams: PropTypes.func.isRequired,
    pending: PropTypes.bool,
};

const defaultProps = {
    searchText: '',
    onSearchChange: () => {},
    listKeySelector: d => d.id,
    list: [],
    pending: false,
};

export default class NaiveSearchList extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
    }

    componentDidMount() {
        const { current: container } = this.containerRef;
        if (container) {
            this.boundingClientRect = container.getBoundingClientRect();
        }
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
            list = [],
            listKeySelector,
            listRenderer,
            listRendererParams,
            searchText,
            onSearchChange,
            pending: searchPending,
        } = this.props;

        const { current: container } = this.containerRef;
        const showList = isTruthyString(searchText);

        return (
            <div
                ref={this.containerRef}
                className={styles.naiveSearchList}
            >
                <TextInput
                    className={styles.searchInput}
                    label={_ts('components.naiveSearchList', 'searchInputLabel')}
                    placeholder={_ts('components.naiveSearchList', 'searchInputPlaceholder')}
                    value={searchText}
                    onChange={onSearchChange}
                    showHintAndError={false}
                />
                {showList &&
                    <FloatingContainer
                        onInvalidate={this.handleOptionsInvalidate}
                        parent={container}
                    >
                        {searchPending && list.length === 0 ? (
                            <div className={styles.loadingAnimationContainer}>
                                <LoadingAnimation />
                            </div>
                        ) : (
                            <ListView
                                className={styles.list}
                                data={list}
                                renderer={listRenderer}
                                rendererParams={listRendererParams}
                                keySelector={listKeySelector}
                                isFiltered={showList}
                            />
                        )}
                    </FloatingContainer>
                }
            </div>
        );
    }
}
