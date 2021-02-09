import { useMemo, useCallback } from 'react';

export function range(start: number, end: number) {
    const length = (end - start) + 1;
    return Array.from({ length }, (_, i) => start + i);
}
interface Props {
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

function usePagination(props: Props) {
    const {
        activePage: activePageFromProps = 1,
        itemsCount,
        maxItemsPerPage,
        disabled = false,
        showFirstButton = false,
        showLastButton = false,
        hideNextButton = false,
        hidePrevButton = false,
        boundaryCount = 1,
        siblingCount = 1,
    } = props;

    const activePage = useMemo(() => Math.max(activePageFromProps, 1), [activePageFromProps]);
    const totalPages = Math.max(Math.ceil(itemsCount / maxItemsPerPage), 1);
    const startPages = range(1, Math.min(boundaryCount, totalPages));

    const endPages = range(
        Math.max((totalPages - boundaryCount) + 1, boundaryCount + 1),
        totalPages,
    );

    const leftSiblings = Math.max(
        Math.min(
            activePage - siblingCount,
            totalPages - boundaryCount - (siblingCount * 2) - 1,
        ),
        boundaryCount + 2,
    );

    const rightSiblings = Math.min(
        Math.max(
            activePage + siblingCount,
            boundaryCount + (siblingCount * 2) + 2,
        ),
        endPages.length > 0 ? endPages[0] - 2 : totalPages - 1,
    );

    const startEllipsis = useMemo(() => {
        if (leftSiblings > boundaryCount + 2) {
            return ['start-ellipsis'];
        } else if (boundaryCount + 1 < totalPages - boundaryCount) {
            return [boundaryCount + 1];
        }
        return [];
    }, [boundaryCount, leftSiblings, totalPages]);

    const endEllipsis = useMemo(() => {
        if (rightSiblings < totalPages - boundaryCount - 1) {
            return ['end-ellipsis'];
        } else if (totalPages - boundaryCount > boundaryCount) {
            return [totalPages - boundaryCount];
        }
        return [];
    }, [boundaryCount, rightSiblings, totalPages]);

    const getPageNumber = useCallback((type: string) => {
        switch (type) {
            case 'first':
                return 1;
            case 'last':
                return totalPages;
            case 'previous':
                return activePage - 1;
            case 'next':
                return activePage + 1;
            default:
                return undefined;
        }
    }, [activePage, totalPages]);

    const itemsList = [
        ...(showFirstButton ? ['first'] : []),
        ...(hidePrevButton ? [] : ['previous']),
        ...startPages,
        ...startEllipsis,
        ...range(leftSiblings, rightSiblings),
        ...endEllipsis,
        ...endPages,
        ...(hideNextButton ? [] : ['next']),
        ...(showLastButton ? ['last'] : []),
    ];

    const items = itemsList.map((item: string | number) => ({
        id: item.toString(),
        page: typeof item === 'number' ? item : getPageNumber(item),
        selected: item === activePage,
        disabled: disabled || ((item === 'next' || item === 'last') &&
            (activePage >= totalPages)) || ((item === 'first' || item ===
                'previous') && (activePage <= 1)),
    }));

    return items;
}

export default usePagination;
