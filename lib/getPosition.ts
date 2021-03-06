interface Position {
    center: [number, number];
}

const getPosition = async (
    province: number | string,
    district?: number | string,
    ward?: number
) => {
    const mapboxApi = (name: string) => {
        return fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${name}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_APIKEY}`
        )
            .then((res) => res.json())
            .then(({ features: pos }: { features: Position[] }) => {
                return pos[1].center;
            });
    };
    return fetch(`https://provinces.open-api.vn/api/p/${province}?depth=2`)
        .then((res) => res.json())
        .then((p) => {
            let name = p.name.replace('Thành phố ', '').replace('Tỉnh ', '') + ', Viet Nam';
            if (!district) {
                name = name.replaceAll(' ', '%20');
                return mapboxApi(name);
            } else {
                return fetch(`https://provinces.open-api.vn/api/d/${district}?depth=2`)
                    .then((res) => res.json())
                    .then((d) => {
                        name = d.name.replace('Quận ', '').replace('Huyện ', '') + ', ' + name;
                        if (!ward) {
                            name = name.replaceAll(' ', '%20');
                            return mapboxApi(name);
                        } else {
                            return fetch(`https://provinces.open-api.vn/api/w/${ward}?depth=2`)
                                .then((res) => res.json())
                                .then((w) => {
                                    name =
                                        w.name.replace('Xã ', '').replace('Phường ', '') +
                                        ', ' +
                                        name;
                                    return mapboxApi(name);
                                });
                        }
                    });
            }
        });
};

const getPlace = async (lng: number, lat: number) => {
    return fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_APIKEY}`
    )
        .then((res) => res.json())
        .then((data) => data.features);
};

const getPlaceName = async (p: number, d: number, w: number) => {
    return Promise.all([
        fetch(`https://provinces.open-api.vn/api/p/${p}?depth=2`)
            .then((res) => res.json())
            .then((data) => data.name),
        fetch(`https://provinces.open-api.vn/api/d/${d}?depth=2`)
            .then((res) => res.json())
            .then((data) => data.name),
        fetch(`https://provinces.open-api.vn/api/w/${w}?depth=2`)
            .then((res) => res.json())
            .then((data) => data.name),
    ]);
};

const formatAddressName = (name: string) => {
    return name
        .replace('Thành phố', '')
        .replace('Tỉnh', '')
        .replace('Huyện', 'H.')
        .replace('Thị xã', 'TX.')
        .replace('Quận', 'Q.')
        .replace('Huyện', 'H.')
        .replace('Thị xã', 'TX.')
        .replace('Phường', 'P.');
};

const getSearchPlaceName = async (p: any, d: any, w: any) => {
    if (!p) {
        throw new Error('Need province field');
    }

    const listAddress = await Promise.all([
        w &&
            fetch(`https://provinces.open-api.vn/api/w/${w}?depth=2`)
                .then((res) => res.json())
                .then((data) => data.name),
        d &&
            fetch(`https://provinces.open-api.vn/api/d/${d}?depth=2`)
                .then((res) => res.json())
                .then((data) => data.name),
        p &&
            fetch(`https://provinces.open-api.vn/api/p/${p}?depth=2`)
                .then((res) => res.json())
                .then((data) => data.name),
    ]);

    return formatAddressName(listAddress.filter((item) => item).join(', '));
};

const getProvinceList = async (all: boolean = true) => {
    try {
        let response = null;
        if (all) {
            response = await fetch('https://provinces.open-api.vn/api/');
        } else {
            response = await fetch('/location/province.json');
        }
        const responseJSON = await response.json();
        return responseJSON;
    } catch (error) {
        console.log('error to get province list: ', error);
    }
};

const getDistrictList = async (code: any) => {
    try {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
        const responseJSON = await response.json();
        return responseJSON;
    } catch (error) {
        console.log('error to get district list: ', error);
    }
};

const getWardList = async (code: any) => {
    try {
        const response = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
        const responseJSON = await response.json();
        return responseJSON;
    } catch (error) {
        console.log('error to get ward list: ', error);
    }
};

const getListExitPosition = async (p: number, d: number, all: boolean = true) => {
    const listProvince: any[] = await getProvinceList(all);
    const listDistrict: any[] = (await getDistrictList(p)).districts;
    const listWard: any[] = (await getWardList(d)).wards;
    const data: [any[], any[], any[]] = [listProvince, listDistrict, listWard];
    return data;
};

export {
    getPosition,
    getPlace,
    getPlaceName,
    getSearchPlaceName,
    getProvinceList,
    getDistrictList,
    getWardList,
    formatAddressName,
    getListExitPosition,
};

export default {};
