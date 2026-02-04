import {LayersControl, MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {customIcon} from "../../constants/MockData.ts";

export default function ContactMap() {
    const position: [number, number] = [52.3965, 16.8720]

    const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`;

    return (
        <div className="w-full h-full min-h-[400px] relative z-0 rounded-2xl overflow-hidden shadow-inner border border-gray-200">
            <MapContainer center={position} zoom={16} scrollWheelZoom={false} className="w-full h-full" style={{ height: "100%", width: "100%", minHeight: "400px" }}>
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Mapa Klasyczna (OSM)">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Mapa Jasna (CartoDB)">
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        />
                    </LayersControl.BaseLayer>


                    <LayersControl.BaseLayer name="Satelita (Esri)">
                        <TileLayer
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>

                </LayersControl>

                <Marker position={position} icon={customIcon}>
                    <Popup className="custom-popup">
                        <div className="text-center p-1">
                            <h3 className="font-bold text-gray-800 text-base mb-1">Medisure Sp. z o.o.</h3>
                            <p className="text-sm text-gray-500 mb-3">ul. Grochowska 21<br/>61-001 Poznań</p>

                            <a href={googleMapsLink} target="_blank" rel="noopener noreferrer"
                               className="custom-link inline-block bg-[#4E61F6] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors no-underline shadow-md">
                                📍 Nawiguj tutaj
                            </a>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

        </div>
    )
}