import { Button, Select } from '@chakra-ui/react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from './styles.module.scss';

export interface IFilterBarProps {}

enum DropDown {
    PRICE,
    SQUARE,
    NONE,
}

export default function FilterBar(props: IFilterBarProps) {
    const [dropDown, setDropDown] = useState<DropDown>(DropDown.NONE);
    const router = useRouter();
    const {
        minPrice,
        maxPrice,
        minWaterPrice,
        maxWaterPrice,
        minElectricityPrice,
        maxElectricityPrice,
        minSquare,
        maxSquare,
        sort,
    } = router.query;

    const isPriceFilter = minPrice || maxPrice;
    const isWaterFilter = minWaterPrice || maxWaterPrice;
    const isElectricityFilter = minElectricityPrice || maxElectricityPrice;
    const isFilterSquare = minSquare || maxSquare;

    const handleSubmitFilter = (e: any) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        router.push({
            pathname: 'search',
            query: {
                ...router.query,
                ...handleFilter(data, router.query),
            },
        });
        setDropDown(DropDown.NONE);
    };

    const handleSubmitSort = (sort: string) => {
        router.push({
            pathname: 'search',
            query: {
                ...router.query,
                sort,
            },
        });
    };

    const handleResetPrice = () => {
        router.push({
            pathname: 'search',
            query: {
                ...router.query,
                minPrice: undefined,
                maxPrice: undefined,
            },
        });
        setDropDown(DropDown.NONE);
    };

    return (
        <div className={styles.filterbar}>
            <div className={styles.item}>
                <div
                    className={clsx(
                        styles.item__label,
                        (isPriceFilter || isElectricityFilter || isWaterFilter) && styles.choose
                    )}
                    onClick={() =>
                        setDropDown(dropDown === DropDown.PRICE ? DropDown.NONE : DropDown.PRICE)
                    }
                >
                    Gi??{' '}
                    <i
                        className={`fa-solid fa-angle-${
                            dropDown === DropDown.PRICE ? 'up' : 'down'
                        }`}
                    ></i>
                </div>
                {dropDown === DropDown.PRICE && (
                    <form className={styles.dropdown__price} onSubmit={handleSubmitFilter}>
                        <div>
                            <span>Ti???n tr???</span>
                            <div>
                                <input
                                    type="number"
                                    name="minPrice"
                                    defaultValue={minPrice && Number(minPrice)}
                                    placeholder="t???i thi???u"
                                />
                                <input
                                    type="number"
                                    name="maxPrice"
                                    defaultValue={maxPrice && Number(maxPrice)}
                                    placeholder="t???i ??a"
                                />
                            </div>
                        </div>
                        <div>
                            <span>Ti???n ??i???n</span>
                            <div>
                                <input
                                    type="number"
                                    placeholder="t???i thi???u"
                                    name="minElectricityPrice"
                                    defaultValue={
                                        minElectricityPrice && Number(minElectricityPrice)
                                    }
                                />
                                <input
                                    type="number"
                                    placeholder="t???i ??a"
                                    name="maxElectricityPrice"
                                    defaultValue={
                                        maxElectricityPrice && Number(maxElectricityPrice)
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <span>Ti???n n?????c</span>
                            <div>
                                <input
                                    type="number"
                                    placeholder="t???i thi???u"
                                    name="minWaterPrice"
                                    defaultValue={minWaterPrice && Number(minWaterPrice)}
                                />
                                <input
                                    type="number"
                                    placeholder="t???i ??a"
                                    name="maxWaterPrice"
                                    defaultValue={maxWaterPrice && Number(maxWaterPrice)}
                                />
                            </div>
                        </div>
                        <Button colorScheme="red" marginRight={2} onClick={handleResetPrice}>
                            Xo??
                        </Button>
                        <Button type="submit" colorScheme="blue">
                            L??u
                        </Button>
                    </form>
                )}
            </div>
            <div className={styles.item}>
                <div
                    className={clsx(styles.item__label, isFilterSquare && styles.choose)}
                    onClick={() =>
                        setDropDown(dropDown === DropDown.SQUARE ? DropDown.NONE : DropDown.SQUARE)
                    }
                >
                    Di???n t??ch{' '}
                    <i
                        className={`fa-solid fa-angle-${
                            dropDown === DropDown.SQUARE ? 'up' : 'down'
                        }`}
                    ></i>
                </div>
                {dropDown === DropDown.SQUARE && (
                    <form className={styles.dropdown__square} onSubmit={handleSubmitFilter}>
                        <div>
                            <span>Di???n t??ch</span>
                            <div>
                                <input
                                    type="number"
                                    placeholder="t???i thi???u"
                                    name="minSquare"
                                    defaultValue={minSquare && Number(minSquare)}
                                />
                                <input
                                    type="number"
                                    placeholder="t???i ??a"
                                    name="maxSquare"
                                    defaultValue={maxSquare && Number(maxSquare)}
                                />
                            </div>
                        </div>
                        <Button type="submit" colorScheme="blue">
                            L??u
                        </Button>
                    </form>
                )}
            </div>
            <div
                className={styles.item__last}
                onChange={(e: any) => handleSubmitSort(e.target.value)}
            >
                <Select>
                    <option value="newest" selected={sort === 'newest'}>
                        M???i nh???t
                    </option>
                    <option value="oldest" selected={sort === 'oldest'}>
                        C?? nh???t
                    </option>
                    <option value="desc" selected={sort === 'desc'}>
                        Gi?? cao
                    </option>
                    <option value="asc" selected={sort === 'asc'}>
                        Gi?? th???p
                    </option>
                </Select>
            </div>
        </div>
    );
}

const handleFilter = (data: any, currentQuery: any) => {
    Object.keys(data).forEach((key) => {
        if (currentQuery[key]) return;
        if (!data[key]) delete data[key];
    });
    return data;
};
