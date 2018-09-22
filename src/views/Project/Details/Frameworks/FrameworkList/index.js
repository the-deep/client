import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import {
    caseInsensitiveSubmatch,
    compareString,
} from '#rsu/common';

import AccentButton from '#rsca/Button/AccentButton';
import SearchInput from '#rsci/SearchInput';
import ListView from '#rscv/List/ListView';
import ListItem from '#rscv/List/ListItem';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';

import _ts from '#ts';
import { iconNames } from '#constants';

import AddFrameworkButton from './AddFrameworkButton';
import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

const FrameworkListItem = ({
    className,
    isActive,
    isSelected,
    framework,
    onClick,
}) => {
    const iconClassName = `
        ${iconNames.checkCircle}
        ${styles.check} 
    `;

    return (
        <ListItem
            className={className}
            active={isActive}
            onClick={onClick}
        >
            <div className={styles.title}>
                { framework.title }
            </div>
            { isSelected && <div className={iconClassName} /> }
        </ListItem>
    );
};


const filterFrameworks = memoize((frameworkList, searchInputValue) => {
    const displayFrameworkList = frameworkList.filter(
        framework => caseInsensitiveSubmatch(
            framework.title,
            searchInputValue,
        ),
    );

    displayFrameworkList.sort(
        (a, b) => compareString(
            a.title,
            b.title,
        ),
    );

    return displayFrameworkList;
});

const getFrameworkKey = framework => framework.id;

export default class FrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            searchInputValue: '',
            showAddFrameworkModal: false,
        };
    }

    handleSearchInputValueChange = (searchInputValue) => {
        this.setState({ searchInputValue });
    }

    itemRendererParams = (key, framework) => ({
        framework,
        isActive: this.props.activeFrameworkId === framework.id,
        isSelected: this.props.selectedFrameworkId === framework.id,
        onClick: () => this.props.onClick(framework.id),
        className: styles.item,
    })

    render() {
        const {
            className: classNameFromProps,
            frameworkList,
            projectId,
        } = this.props;

        const {
            searchInputValue,
            showAddFrameworkModal,
        } = this.state;

        if (!frameworkList) {
            return null;
        }

        const displayFrameworkList = filterFrameworks(
            frameworkList,
            searchInputValue,
        );

        const className = `
            ${classNameFromProps}
            ${styles.frameworkList}
        `;

        return (
            <div className={className}>
                <header className={styles.header}>
                    <h4 className={styles.heading}>
                        {_ts('project', 'frameworkListHeading')}
                    </h4>
                    <AddFrameworkButton
                        projectId={projectId}
                    />
                    <SearchInput
                        className={styles.frameworkSearchInput}
                        value={searchInputValue}
                        onChange={this.handleSearchInputValueChange}
                        placeholder={_ts('project', 'searchAfPlaceholder')}
                        showHintAndError={false}
                        showLabel={false}
                    />
                </header>
                <ListView
                    data={displayFrameworkList}
                    className={styles.content}
                    renderer={FrameworkListItem}
                    rendererParams={this.itemRendererParams}
                    keyExtractor={getFrameworkKey}
                />
            </div>
        );
    }
}
