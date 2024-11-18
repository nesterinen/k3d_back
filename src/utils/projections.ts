import proj4 from "proj4"

export const WGS84toETRS89 = (latitude: number, longitude: number): number[] => {
    const ETRS89 = 'PROJCS["ETRS89 / TM35FIN(E,N)",' +
    'GEOGCS["ETRS89",' +
        'DATUM["European_Terrestrial_Reference_System_1989",' +
            'SPHEROID["GRS 1980",6378137,298.257222101,' +
                'AUTHORITY["EPSG","7019"]],' +
            'AUTHORITY["EPSG","6258"]],' +
        'PRIMEM["Greenwich",0,' +
            'AUTHORITY["EPSG","8901"]],' +
        'UNIT["degree",0.0174532925199433,' +
            'AUTHORITY["EPSG","9122"]],' +
        'AUTHORITY["EPSG","4258"]],' +
    'PROJECTION["Transverse_Mercator"],' +
    'PARAMETER["latitude_of_origin",0],' +
    'PARAMETER["central_meridian",27],' +
    'PARAMETER["scale_factor",0.9996],' +
    'PARAMETER["false_easting",500000],' +
    'PARAMETER["false_northing",0],' +
    'UNIT["metre",1,' +
        'AUTHORITY["EPSG","9001"]],' +
    'AXIS["Easting",EAST],' +
    'AXIS["Northing",NORTH],' +
    'AUTHORITY["EPSG","3067"]]'

    // 'EPSG:4326' -> WGS84 - World Geodetic System 1984, used in GPS 
    // 'EPSG:3067' -> ETRS89 / TM35FIN(E,N) -- Finland
    //[29.762067322297078, 62.60064557510063] //Joensuun tori
    return proj4('EPSG:4326', ETRS89).forward([longitude, latitude])
}

/*
def bbox_from_position(east, north, size=1000):
    if type(size) != int:
        raise Exception('size must be an int.')

    left, bottom = east - size/2, north - size/2
    right, top = east + size/2, north + size/2

    return [int(left), int(bottom), int(right), int(top)]
*/
export const bboxFromETRS89 = (easting: number, northing: number, size=1000) => {
    const left = easting - size/2
    const bottom = northing - size/2
    const right = easting + size/2
    const top = northing + size/2

    return [Math.floor(left), Math.floor(bottom), Math.floor(right), Math.floor(top)]
}