import React, { useCallback } from 'react';
import ListView from '#rsu/../v2/View/ListView';
import Icon from '#rscg/Icon';
import Button, { ButtonVariant } from '#components/ui/Button';
import usePagination, { PageItem } from './usePagination';

import styles from './styles.scss';

interface Props {
    handleClick?: (page?: number) => void;
    activePage: number;
    itemsCount: number;
    maxItemsPerPage: number;
    disabled?: boolean;
    showFirstButton?: boolean;
    showLastButton?: boolean;
    hideNextButton?: boolean;
    hidePrevButton?: boolean;
    boundaryCount?: number;
    siblingCount?: number;
}

interface Page {
    page?: number;
    id: string;
    selected: boolean;
    disabled: boolean;
}

const pageKeySelector = (d: Page) => d.id;

const pageTypeToIconNameMap: {
    [key in PageItem]: string;
} = {
    next: 'next',
    previous: 'prev',
    first: 'skipBack',
    last: 'skipForward',
    'start-ellipsis': 'ellipsis',
    'end-ellipsis': 'ellipsis',
};

function Pagination(props: Props) {
    const { handleClick, ...others } = props;

    const pages = usePagination(others);

    const getPaginationButtonValue = useCallback((id) => {
        const pageKeys = Object.keys(pageTypeToIconNameMap);

        if (pageKeys.findIndex(p => p === id) === -1) {
            return id;
        }

        return <Icon name={pageTypeToIconNameMap[id]} />;
    }, []);

    const pageRendererParams = (_: string, value: Page) => {
        const { selected, page, disabled, id } = value;
        const variant: ButtonVariant = selected ? 'primary' : 'secondary';
        const children = getPaginationButtonValue(id);

        return ({
            variant,
            name: page,
            disabled,
            children,
            onClick: handleClick,
        });
    };

    return (
        <ListView
            className={styles.pagination}
            data={pages}
            renderer={Button}
            keySelector={pageKeySelector}
            rendererParams={pageRendererParams}
        />
    );
}

export default Pagination;
