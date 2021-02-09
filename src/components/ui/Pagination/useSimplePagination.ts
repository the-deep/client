import { useMemo, useCallback } from 'react';
import { range } from './usePagination';

interface Props {
    activePage: number;
    itemsCount: number;
    maxItemsPerPage: number;
    disabled?: boolean;
    showPages?: boolean;
}

function useSimplePagination(props: Props) {
    const {
        activePage: activePageFromProps = 1,
        itemsCount,
        maxItemsPerPage,
        disabled = false,
        showPages = false,
    } = props;

    const activePage = useMemo(() => Math.max(activePageFromProps, 1), [activePageFromProps]);
    const totalPages = Math.max(Math.ceil(itemsCount / maxItemsPerPage), 1);

    const getPageNumber = useCallback((type: string) => {
        switch (type) {
            case 'previous':
                return activePage - 1;
            case 'next':
                return activePage + 1;
            default:
                return undefined;
        }
    }, [activePage]);

    const getPaginationItem = useCallback((item: string | number) => ({
        id: item.toString(),
        page: typeof item === 'number' ? item : getPageNumber(item),
        selected: item === activePage,
        disabled: disabled || ((item === 'next' || item === 'last') &&
            (activePage >= totalPages)) || ((item === 'first' || item ===
                'previous') && (activePage <= 1)),
    }), [totalPages, getPageNumber, activePage, disabled]);

    if (showPages) {
        const itemList = [...range(1, totalPages)];
        const items = itemList.map(getPaginationItem);
        return items;
    }
    const itemsList = [
        'previous',
        'next',
    ];
    const items = itemsList.map(getPaginationItem);

    return items;
}

export default useSimplePagination;
