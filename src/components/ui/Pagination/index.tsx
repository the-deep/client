import React, { useCallback } from 'react';
import ListView from '#rsu/../v2/View/ListView';
import Icon from '#rscg/Icon';
import Button, { ButtonVariant } from '#components/ui/Button';
import usePagination from './usePagination';

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

function Pagination(props: Props) {
    const { handleClick, ...others } = props;

    const pages = usePagination(others);

    const getPaginationButtonValue = useCallback((id) => {
        switch (id) {
            case 'previous':
                return <Icon name="prev" />;
            case 'next':
                return <Icon name="next" />;
            case 'first':
                return <Icon name="skipBack" />;
            case 'last':
                return <Icon name="skipForward" />;
            case 'start-ellipsis':
                return <span>&hellip;</span>;
            case 'end-ellipsis':
                return <span>&hellip;</span>;
            default:
                return id;
        }
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
