/**
 * Ray-casting algorithm to check if a point is inside a polygon.
 * @param point {lat, lng}
 * @param polygon Array of [lat, lng] arrays
 */
export function isPointInPolygon(point: {lat: number, lng: number}, polygon: [number, number][]): boolean {
    const x = point.lat;
    const y = point.lng;
    
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];
        
        const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}

/**
 * Calculate approximate area in square meters using the Shoelace formula.
 * Converts lat/lng to meters approximately (1 deg lat ~ 111,111m).
 */
export function calculateApproxArea(polygon: [number, number][]): number {
    if (polygon.length < 3) return 0;

    const EARTH_RADIUS = 6378137; // meters
    let area = 0;

    if (polygon.length > 2) {
        for (let i = 0; i < polygon.length; i++) {
            const j = (i + 1) % polygon.length;
            
            // Convert to radians
            const p1Lat = polygon[i][0] * Math.PI / 180;
            const p1Lng = polygon[i][1] * Math.PI / 180;
            const p2Lat = polygon[j][0] * Math.PI / 180;
            const p2Lng = polygon[j][1] * Math.PI / 180;

            // Spherical excess (simplified for small areas like land plots)
            // Using a simple projection for small areas is usually sufficient
            // x = R * lng * cos(lat), y = R * lat
            
            const x1 = EARTH_RADIUS * p1Lng * Math.cos(p1Lat);
            const y1 = EARTH_RADIUS * p1Lat;
            const x2 = EARTH_RADIUS * p2Lng * Math.cos(p2Lat);
            const y2 = EARTH_RADIUS * p2Lat;

            area += (x1 * y2) - (x2 * y1);
        }
        area = Math.abs(area) / 2;
    }

    return area;
}
