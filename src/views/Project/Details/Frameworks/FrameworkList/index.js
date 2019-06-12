import PropTypes from 'prop-types';
import React from 'react';
import Faram from '@togglecorp/faram';

import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';

import Icon from '#rscg/Icon';
import SearchInput from '#rsci/SearchInput';
import SegmentInput from '#rsci/SegmentInput';
import Checkbox from '#rsci/Checkbox';
import ListView from '#rscv/List/ListView';
import ListItem from '#rscv/List/ListItem';
import AccentButton from '#rsca/Button/AccentButton';
import modalize from '#rscg/Modalize';

import _ts from '#ts';

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
    readOnly: PropTypes.bool,
};

const defaultProps = {
    className: '',
    frameworkList: [],

    // Apparently there can be no frameworks in projects
    selectedFrameworkId: undefined,
    readOnly: false,
};

const fameworkActivityOptions = [
    { key: 'all', label: _ts('project.framework', 'frameworkActivityAllTitle') },
    { key: 'active', label: _ts('project.framework', 'frameworkActivityActiveTitle') },
    { key: 'inactive', label: _ts('project.framework', 'frameworkActivityInactiveTitle') },
];

// TODO: move to separate component
const FrameworkListItem = ({
    className,
    isActive,
    isSelected,
    framework: { title },
    onClick,
}) => (
    <ListItem
        className={className}
        active={isActive}
        onClick={onClick}
    >
        <div className={styles.title}>
            { title }
        </div>
        { isSelected &&
            <Icon
                name="checkCircle"
                className={styles.check}
            />
        }
    </ListItem>
);

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

const getFrameworkKey = framework => framework.id;

const requests = {
    frameworkListGetRequest: {
        url: '/analysis-frameworks/',
        method: requestMethods.POST,
        body: ({ params: { body } }) => body,
        onSuccess: ({
            params: { onSuccess },
            response,
        }) => {
            onSuccess(response);
        },
    },
};

@RequestCoordinator
@RequestClient(requests)
export default class FrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            // TODO: move to redux
            faramValues: {
                activity: 'active',
                relatedToMe: true,
                search: '',
            },
        };

        this.schema = {
            fields: {
                search: [],
                activity: [],
                relatedToMe: [],
            },
        };
    }

    componentDidMount() {
        // FIXME: use common function for onFaramChange,
        const { frameworkListGetRequest } = this.props;
        const { faramValues } = this.state;

        frameworkListGetRequest.do({
            body: faramValues,
            onSuccess: this.handleFrameworkListGetSuccess,
        });
    }

    handleFrameworkListGetSuccess = (response) => {
        console.warn(response);
    }

    handleFaramChange = (newFaramValues) => {
        this.setState({ faramValues: newFaramValues });

        const { frameworkListGetRequest } = this.props;
        const { faramValues } = this.state;

        frameworkListGetRequest.do({
            body: faramValues,
            onSuccess: this.handleFrameworkListGetSuccess,
        });
    };

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
            readOnly,
        } = this.props;

        const { faramValues } = this.state;


        if (!frameworkList) {
            return null;
        }

        // TODO: Filtered framework list
        const displayFrameworkList = frameworkList;

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
                            disabled={readOnly}
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
                        onChange={this.handleFaramChange}
                        schema={this.schema}
                        value={faramValues}
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
