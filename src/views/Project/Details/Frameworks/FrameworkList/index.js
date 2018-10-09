import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import {
    caseInsensitiveSubmatch,
    compareString,
} from '#rsu/common';

import SearchInput from '#rsci/SearchInput';
import ListView from '#rscv/List/ListView';
import ListItem from '#rscv/List/ListItem';
import AccentButton from '#rsca/Button/AccentButton';
import modalize from '#rscg/Modalize';

import _ts from '#ts';
import { iconNames } from '#constants';

import AddFrameworkModal from './AddFrameworkModal';
import styles from './styles.scss';

const AccentModalButton = modalize(AccentButton);

const propTypes = {
    activeFrameworkId: PropTypes.number.isRequired,
    className: PropTypes.string,
    frameworkList: PropTypes.arrayOf(PropTypes.object),
    onClick: PropTypes.func.isRequired,
    selectedFrameworkId: PropTypes.number,
    projectId: PropTypes.number.isRequired,
    setActiveFramework: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    frameworkList: [],

    // Apparently there can be no frameworks in projects
    selectedFrameworkId: undefined,
};

// TODO: move to separate component
const FrameworkListItem = ({
    className,
    isActive,
    isSelected,
    framework: { title },
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
                { title }
            </div>
            { isSelected && <div className={iconClassName} /> }
        </ListItem>
    );
};

FrameworkListItem.propTypes = {
    className: PropTypes.string,
    isActive: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    framework: PropTypes.shape({
        title: PropTypes.string,
    }).isRequired,
    onClick: PropTypes.func.isRequired,
};

FrameworkListItem.defaultProps = {
    className: '',
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
            setActiveFramework,
        } = this.props;

        const { searchInputValue } = this.state;

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
                        {_ts('project.framework', 'frameworkListHeading')}
                    </h4>

                    <AccentModalButton
                        iconName={iconNames.add}
                        modal={
                            <AddFrameworkModal
                                projectId={projectId}
                                setActiveFramework={setActiveFramework}
                            />
                        }
                    >
                        { _ts('project.framework', 'addFrameworkButtonLabel')}
                    </AccentModalButton>

                    <SearchInput
                        className={styles.frameworkSearchInput}
                        value={searchInputValue}
                        onChange={this.handleSearchInputValueChange}
                        placeholder={_ts('project.framework', 'searchFrameworkInputPlaceholder')}
                        showHintAndError={false}
                        showLabel={false}
                    />
                </header>
                <ListView
                    data={displayFrameworkList}
                    className={styles.content}
                    renderer={FrameworkListItem}
                    rendererParams={this.itemRendererParams}
                    keySelector={getFrameworkKey}
                />
            </div>
        );
    }
}
