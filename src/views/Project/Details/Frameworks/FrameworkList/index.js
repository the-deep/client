import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import Faram from '@togglecorp/faram';
import {
    isTruthyString,
    _cs,
    compareString,
} from '@togglecorp/fujs';

import SearchInput from '#rsci/SearchInput';
import SegmentInput from '#rsci/SegmentInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Checkbox from '#rsci/Checkbox';
import ListView from '#rscv/List/ListView';
import AccentButton from '#rsca/Button/AccentButton';
import modalize from '#rscg/Modalize';

import {
    RequestClient,
    requestMethods,
} from '#request';

import _ts from '#ts';

import AddFrameworkModal from '../AddFrameworkModal';
import FrameworkListItem from './FrameworkListItem';
import styles from './styles.scss';

const AccentModalButton = modalize(AccentButton);

const propTypes = {
    activeFrameworkId: PropTypes.number.isRequired,
    className: PropTypes.string,
    usedFrameworkId: PropTypes.number,
    projectId: PropTypes.number.isRequired,
    setActiveFramework: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    frameworkList: PropTypes.array,
    onFilterChange: PropTypes.func.isRequired,
    filterValues: PropTypes.shape({
        search: PropTypes.string,
        activity: PropTypes.string,
        relatedToMe: PropTypes.bool,
    }).isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    frameworkListGetRequest: PropTypes.object.isRequired,
};

const defaultProps = {
    className: '',

    // Apparently there can be no frameworks in projects
    usedFrameworkId: undefined,
    readOnly: false,
    frameworkList: [],
};

const fameworkActivityOptions = [
    { key: 'active', label: _ts('project.framework', 'frameworkActivityActiveTitle') },
    { key: 'inactive', label: _ts('project.framework', 'frameworkActivityInactiveTitle') },
    { key: 'all', label: _ts('project.framework', 'frameworkActivityAllTitle') },
];

const getFrameworkKey = framework => framework.id;


const requests = {
    frameworkListGetRequest: {
        url: '/analysis-frameworks/',
        method: requestMethods.GET,
        query: ({ props: { filterValues } }) => ({
            ...filterValues,
            fields: ['id', 'title', 'is_private'],
            ordering: 'title',
        }),
        onPropsChanged: ['filterValues'],
        onMount: true,
        onSuccess: ({
            props: { setFrameworkList },
            response,
        }) => {
            const { results } = response;
            setFrameworkList({ analysisFrameworks: results });
        },
        schemaName: 'analysisFrameworkTitleList',
    },
};

@RequestClient(requests)
export default class FrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isFiltered = ({ search, activity, relatedToMe }) => (
        isTruthyString(search) || activity !== 'all' || relatedToMe
    );

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
        isSelected: this.props.usedFrameworkId === framework.id,
        onClick: () => this.props.setActiveFramework(framework.id),
    })

    sortFrameworkList = memoize(frameworks =>
        frameworks.sort((a, b) => compareString(a.title, b.title)))

    render() {
        const {
            className: classNameFromProps,
            projectId,
            setActiveFramework,
            readOnly,
            filterValues,
            frameworkList,
            frameworkListGetRequest: {
                pending,
            },
            onFilterChange,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.frameworkList,
        );

        const filtered = FrameworkList.isFiltered(filterValues);
        const sortedFrameworkList = this.sortFrameworkList(frameworkList);

        return (
            <div className={className}>
                <header className={styles.header}>
                    <div className={styles.top}>
                        <h4 className={styles.heading}>
                            {_ts('project.framework', 'frameworkListHeading')}
                        </h4>

                        <AccentModalButton
                            iconName="add"
                            disabled={readOnly || pending}
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
                <div className={styles.listContainer}>
                    {pending &&
                        <LoadingAnimation
                            className={styles.loadingAnimation}
                        />
                    }
                    <ListView
                        data={sortedFrameworkList}
                        className={styles.content}
                        renderer={FrameworkListItem}
                        rendererParams={this.itemRendererParams}
                        keySelector={getFrameworkKey}
                        isFiltered={filtered}
                    />
                </div>
            </div>
        );
    }
}
