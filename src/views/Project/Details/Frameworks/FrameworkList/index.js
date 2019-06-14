import PropTypes from 'prop-types';
import React from 'react';
import Faram from '@togglecorp/faram';

import SearchInput from '#rsci/SearchInput';
import SegmentInput from '#rsci/SegmentInput';
import Checkbox from '#rsci/Checkbox';
import ListView from '#rscv/List/ListView';
import AccentButton from '#rsca/Button/AccentButton';
import modalize from '#rscg/Modalize';

import _ts from '#ts';

import AddFrameworkModal from './AddFrameworkModal';
import FrameworkListItem from './FrameworkListItem';
import styles from './styles.scss';

const AccentModalButton = modalize(AccentButton);

const propTypes = {
    activeFrameworkId: PropTypes.number.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    selectedFrameworkId: PropTypes.number,
    projectId: PropTypes.number.isRequired,
    setActiveFramework: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    className: '',

    // Apparently there can be no frameworks in projects
    selectedFrameworkId: undefined,
    readOnly: false,
};

const fameworkActivityOptions = [
    { key: 'all', label: _ts('project.framework', 'frameworkActivityAllTitle') },
    { key: 'active', label: _ts('project.framework', 'frameworkActivityActiveTitle') },
    { key: 'inactive', label: _ts('project.framework', 'frameworkActivityInactiveTitle') },
];

const getFrameworkKey = framework => framework.id;

export default class FrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.schema = {
            fields: {
                search: [],
                activity: [],
                relatedToMe: [],
            },
        };
    }

    itemRendererParams = (key, framework) => ({
        framework,
        isActive: this.props.activeFrameworkId === framework.id,
        isSelected: this.props.selectedFrameworkId === framework.id,
        onClick: () => this.props.onClick(framework.id),
    })

    render() {
        const {
            className: classNameFromProps,
            projectId,
            setActiveFramework,
            readOnly,
            filterValues,
            frameworkList,
            frameworkListPending,
            onFilterChange,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.frameworkList}
        `;

        return (
            <div className={className}>
                <header className={styles.header}>
                    <div className={styles.top}>
                        <h4 className={styles.heading}>
                            {_ts('project.framework', 'frameworkListHeading')}
                        </h4>

                        <AccentModalButton
                            iconName="add"
                            disabled={readOnly && frameworkListPending}
                            className={styles.addFrameworkButton}
                            transparent
                            modal={
                                <AddFrameworkModal
                                    projectId={projectId}
                                    setActiveFramework={setActiveFramework}
                                />
                            }
                        >
                            { _ts('project.framework', 'addFrameworkButtonLabel')}
                        </AccentModalButton>
                    </div>
                    <Faram
                        className={styles.bottom}
                        onChange={onFilterChange}
                        schema={this.schema}
                        value={filterValues}
                        disabled={frameworkListPending}
                    >
                        <SearchInput
                            faramElementName="search"
                            className={styles.frameworkSearchInput}
                            placeholder={_ts('project.framework', 'searchFrameworkInputPlaceholder')}
                            showHintAndError={false}
                            showLabel={false}
                        />

                        <div className={styles.filters}>
                            <SegmentInput
                                faramElementName="activity"
                                className={styles.frameworkActivityInput}
                                showLabel={false}
                                showHintAndError={false}
                                options={fameworkActivityOptions}
                            />
                            <Checkbox
                                faramElementName="relatedToMe"
                                className={styles.relatedToMe}
                                label={_ts('project.framework', 'relatedToMeTitle')}
                            />
                        </div>
                    </Faram>
                </header>
                <ListView
                    pending={frameworkListPending}
                    data={frameworkList}
                    className={styles.content}
                    renderer={FrameworkListItem}
                    rendererParams={this.itemRendererParams}
                    keySelector={getFrameworkKey}
                />
            </div>
        );
    }
}
