import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Layers, Filter, Search, Satellite, Map as MapIcon, PenTool, Trash2, Save, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';

// Fix default marker icons (Leaflet + webpack issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TILE_LAYERS = {
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Earthstar Geographics',
  },
};

const BRASIL_CENTER = [-14.235, -51.925];
const DEFAULT_ZOOM = 4;

// Component to programmatically control map
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Geocoding via Nominatim (free, no API key)
async function geocodeAddress(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'pt-BR' },
  });
  if (!res.ok) throw new Error('Erro na busca de endereço');
  return res.json();
}

// Calculate area of polygon using Shoelace formula with Haversine for real m²
function calcularAreaM2(latlngs) {
  if (!latlngs || latlngs.length < 3) return 0;
  // Use L.GeometryUtil if available, otherwise use geodesic calculation
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  let area = 0;
  const n = latlngs.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = toRad(latlngs[i].lat);
    const lat2 = toRad(latlngs[j].lat);
    const lng1 = toRad(latlngs[i].lng);
    const lng2 = toRad(latlngs[j].lng);
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  area = Math.abs((area * R * R) / 2);
  return area;
}

// Calculate perimeter using Haversine distance
function calcularPerimetroM(latlngs) {
  if (!latlngs || latlngs.length < 2) return 0;
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  let perimetro = 0;

  for (let i = 0; i < latlngs.length; i++) {
    const j = (i + 1) % latlngs.length;
    const dLat = toRad(latlngs[j].lat - latlngs[i].lat);
    const dLng = toRad(latlngs[j].lng - latlngs[i].lng);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(latlngs[i].lat)) * Math.cos(toRad(latlngs[j].lat)) * Math.sin(dLng / 2) ** 2;
    perimetro += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  return perimetro;
}

function formatArea(m2) {
  if (m2 >= 10000) return `${(m2 / 10000).toFixed(2)} ha`;
  return `${m2.toFixed(1)} m²`;
}

function formatPerimeter(m) {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${m.toFixed(1)} m`;
}

const regioesBrasil = [
  { nome: 'Norte', irradiacao: 5.5, cor: '#D4A843', lat: -3.1, lng: -60.0 },
  { nome: 'Nordeste', irradiacao: 5.8, cor: '#D4A843', lat: -9.0, lng: -38.5 },
  { nome: 'Centro-Oeste', irradiacao: 5.4, cor: '#F0C96B', lat: -15.6, lng: -49.3 },
  { nome: 'Sudeste', irradiacao: 4.8, cor: '#1FD8A4', lat: -22.0, lng: -44.0 },
  { nome: 'Sul', irradiacao: 4.3, cor: '#4A9EFF', lat: -27.5, lng: -50.5 },
];

function createRegionIcon(cor, irradiacao, selected) {
  const size = selected ? 42 : 34;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${cor}22;border:2px solid ${cor};
      border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-family:'JetBrains Mono',monospace;font-size:0.65rem;font-weight:700;color:${cor};
      transition:all 0.2s;
    ">${irradiacao}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function MapaSolar() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [regiaoSelecionada, setRegiaoSelecionada] = useState(null);
  const [tileLayer, setTileLayer] = useState('streets');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchMarker, setSearchMarker] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [flyZoom, setFlyZoom] = useState(null);
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [areaInfo, setAreaInfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const mapRef = useRef(null);
  const featureGroupRef = useRef(null);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const results = await geocodeAddress(searchQuery);
      setSearchResults(results);
      if (results.length > 0) {
        const { lat, lon } = results[0];
        const coords = [parseFloat(lat), parseFloat(lon)];
        setSearchMarker({ position: coords, name: results[0].display_name });
        setFlyTo(coords);
        setFlyZoom(14);
      }
    } catch {
      // silently fail
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const selectSearchResult = (result) => {
    const coords = [parseFloat(result.lat), parseFloat(result.lon)];
    setSearchMarker({ position: coords, name: result.display_name });
    setFlyTo(coords);
    setFlyZoom(14);
    setSearchResults([]);
  };

  const recenterBrasil = () => {
    setFlyTo(BRASIL_CENTER);
    setFlyZoom(DEFAULT_ZOOM);
    setSearchMarker(null);
  };

  const toggleSatellite = () => {
    setTileLayer(prev => prev === 'streets' ? 'satellite' : 'streets');
  };

  // Handle polygon creation
  const onCreated = (e) => {
    const { layer } = e;
    const latlngs = layer.getLatLngs()[0];
    const coords = latlngs.map(ll => ({ lat: ll.lat, lng: ll.lng }));
    const area = calcularAreaM2(coords);
    const perimetro = calcularPerimetroM(coords);

    setDrawnPolygon(coords);
    setAreaInfo({ area, perimetro, pontos: coords.length });
    setSaveStatus(null);
  };

  // Handle polygon edit
  const onEdited = (e) => {
    const layers = e.layers;
    layers.eachLayer((layer) => {
      const latlngs = layer.getLatLngs()[0];
      const coords = latlngs.map(ll => ({ lat: ll.lat, lng: ll.lng }));
      const area = calcularAreaM2(coords);
      const perimetro = calcularPerimetroM(coords);

      setDrawnPolygon(coords);
      setAreaInfo({ area, perimetro, pontos: coords.length });
      setSaveStatus(null);
    });
  };

  // Handle polygon delete
  const onDeleted = () => {
    setDrawnPolygon(null);
    setAreaInfo(null);
    setSaveStatus(null);
  };

  // Save polygon to backend
  const salvarPoligono = async () => {
    if (!drawnPolygon || drawnPolygon.length < 3) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/mapa/area', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          coordenadas: drawnPolygon,
          area_m2: areaInfo.area,
          perimetro_m: areaInfo.perimetro,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveStatus({ type: 'success', message: 'Área salva com sucesso!' });
      } else {
        setSaveStatus({ type: 'error', message: data.error || 'Erro ao salvar.' });
      }
    } catch {
      setSaveStatus({ type: 'error', message: 'Erro de conexão com o servidor.' });
    } finally {
      setSaving(false);
    }
  };

  const clearPolygon = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }
    setDrawnPolygon(null);
    setAreaInfo(null);
    setSaveStatus(null);
  };

  const currentTile = TILE_LAYERS[tileLayer];

  return (
    <div>
      <div className="page-header">
        <h1>Mapa Solar</h1>
        <p>Visualize a irradiação solar e desenhe áreas para análise</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Map area */}
        <Card style={{ position: 'relative', minHeight: '560px', overflow: 'hidden', padding: 0 }}>
          {/* Search bar */}
          <form onSubmit={handleSearch} style={{
            position: 'absolute',
            top: '14px',
            left: '60px',
            zIndex: 1000,
            display: 'flex',
            gap: '6px',
            width: 'min(380px, calc(100% - 140px))',
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar endereço..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border-mid)',
                background: 'var(--bg-card)',
                color: 'var(--text-1)',
                fontSize: '0.85rem',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            />
            <button type="submit" disabled={searching} style={{
              padding: '8px 12px',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border-mid)',
              background: 'var(--gold)',
              color: '#000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              <Search size={14} />
              {searching ? '...' : 'Buscar'}
            </button>
          </form>

          {/* Search results dropdown */}
          {searchResults.length > 1 && (
            <div style={{
              position: 'absolute',
              top: '52px',
              left: '60px',
              zIndex: 1000,
              width: 'min(380px, calc(100% - 140px))',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              borderRadius: 'var(--r-sm)',
              maxHeight: '200px',
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}>
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectSearchResult(r)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text-2)',
                    fontSize: '0.78rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {r.display_name}
                </button>
              ))}
            </div>
          )}

          {/* Map controls overlay */}
          <div style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 1000,
          }}>
            <button onClick={toggleSatellite} title={tileLayer === 'streets' ? 'Modo Satélite' : 'Modo Mapa'} style={{
              width: 36,
              height: 36,
              background: tileLayer === 'satellite' ? 'var(--gold)' : 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              borderRadius: 'var(--r-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: tileLayer === 'satellite' ? '#000' : 'var(--text-2)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              {tileLayer === 'satellite' ? <MapIcon size={16} /> : <Satellite size={16} />}
            </button>
            <button onClick={recenterBrasil} title="Recentrar no Brasil" style={{
              width: 36,
              height: 36,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              borderRadius: 'var(--r-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-2)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              <MapIcon size={16} />
            </button>
          </div>

          {/* Leaflet Map */}
          <MapContainer
            center={BRASIL_CENTER}
            zoom={DEFAULT_ZOOM}
            ref={mapRef}
            style={{ width: '100%', height: '560px', borderRadius: 'var(--r)' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer url={currentTile.url} attribution={currentTile.attribution} />
            <MapController center={flyTo} zoom={flyZoom} />

            {/* Drawing controls */}
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topleft"
                onCreated={onCreated}
                onEdited={onEdited}
                onDeleted={onDeleted}
                draw={{
                  polygon: {
                    allowIntersection: false,
                    shapeOptions: {
                      color: '#D4A843',
                      fillColor: '#D4A843',
                      fillOpacity: 0.2,
                      weight: 2,
                    },
                  },
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  polyline: false,
                }}
                edit={{
                  edit: true,
                  remove: true,
                }}
              />
            </FeatureGroup>

            {/* Region markers */}
            {regioesBrasil.map((r, i) => (
              <Marker
                key={i}
                position={[r.lat, r.lng]}
                icon={createRegionIcon(r.cor, r.irradiacao, regiaoSelecionada?.nome === r.nome)}
                eventHandlers={{ click: () => setRegiaoSelecionada(r) }}
              >
                <Popup>
                  <strong>{r.nome}</strong><br />
                  Irradiação: {r.irradiacao} kWh/m²/dia
                </Popup>
              </Marker>
            ))}

            {/* Search result marker */}
            {searchMarker && (
              <Marker position={searchMarker.position}>
                <Popup>{searchMarker.name}</Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Attribution overlay */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            fontSize: '0.65rem',
            color: 'var(--text-3)',
            zIndex: 999,
            background: 'rgba(4,9,15,0.7)',
            padding: '2px 6px',
            borderRadius: '4px',
          }}>
            Irradiação: kWh/m²/dia · Fonte: INPE/Atlas Solar
          </div>
        </Card>

        {/* Sidebar panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Area info (polygon drawn) */}
          {areaInfo && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <PenTool size={18} color="var(--gold)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Área Selecionada</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Área Total
                  </div>
                  <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--gold)' }}>
                    {formatArea(areaInfo.area)}
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Perímetro
                  </div>
                  <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)' }}>
                    {formatPerimeter(areaInfo.perimetro)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', fontSize: '0.78rem', color: 'var(--text-3)' }}>
                  <span className="mono">{areaInfo.pontos} pontos</span>
                  <span>·</span>
                  <span className="mono">{areaInfo.area.toFixed(1)} m²</span>
                </div>

                {/* Coordinates list */}
                <div style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  padding: '8px',
                  background: 'var(--bg-base)',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--border)',
                }}>
                  {drawnPolygon.map((p, i) => (
                    <div key={i} className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-3)', lineHeight: 1.8 }}>
                      P{i + 1}: {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={salvarPoligono} disabled={saving} style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--r-sm)',
                    border: 'none',
                    background: 'var(--gold)',
                    color: '#000',
                    cursor: saving ? 'wait' : 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}>
                    <Save size={14} />
                    {saving ? 'Salvando...' : 'Salvar Área'}
                  </button>
                  <button onClick={clearPolygon} style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border-mid)',
                    background: 'transparent',
                    color: 'var(--coral)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Usar na Simulação */}
                <button
                  onClick={() => {
                    // Detectar região baseado na localização do polígono
                    const centroLat = drawnPolygon.reduce((s, p) => s + p.lat, 0) / drawnPolygon.length;
                    let regiao = 'sudeste';
                    if (centroLat > -5) regiao = 'norte';
                    else if (centroLat > -13) regiao = 'nordeste';
                    else if (centroLat > -20) regiao = 'centro_oeste';
                    else if (centroLat > -24) regiao = 'sudeste';
                    else regiao = 'sul';

                    dispatch({
                      type: 'SET_AREA_MAPA',
                      payload: {
                        areaM2: areaInfo.area,
                        perimetro: areaInfo.perimetro,
                        coordenadas: drawnPolygon,
                        regiao,
                        localizacao: searchMarker?.name || '',
                      },
                    });
                    navigate('/simulacao');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--green-border)',
                    background: 'var(--green-dim)',
                    color: 'var(--green)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <ArrowRight size={14} />
                  Usar na Simulação
                </button>

                {/* Save status */}
                {saveStatus && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--r-sm)',
                    background: saveStatus.type === 'success' ? 'var(--green-dim)' : 'var(--coral-dim)',
                    color: saveStatus.type === 'success' ? 'var(--green)' : 'var(--coral)',
                    fontSize: '0.8rem',
                  }}>
                    {saveStatus.message}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Search marker info */}
          {searchMarker && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Search size={18} color="var(--gold)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Local Encontrado</h3>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                {searchMarker.name}
              </div>
              <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '8px' }}>
                {searchMarker.position[0].toFixed(5)}, {searchMarker.position[1].toFixed(5)}
              </div>
            </Card>
          )}

          {/* Layers */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Layers size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Modo do Mapa</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'streets', label: 'Mapa Padrão' },
                { id: 'satellite', label: 'Satélite' },
              ].map((opt) => (
                <label key={opt.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: tileLayer === opt.id ? 'var(--bg-elevated)' : 'transparent',
                  borderRadius: 'var(--r-sm)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all var(--t)',
                }}>
                  <input
                    type="radio"
                    name="tileLayer"
                    checked={tileLayer === opt.id}
                    onChange={() => setTileLayer(opt.id)}
                    style={{ accentColor: 'var(--gold)' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </Card>

          {/* Region info */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Filter size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                {regiaoSelecionada ? regiaoSelecionada.nome : 'Selecione uma região'}
              </h3>
            </div>

            {regiaoSelecionada ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Irradiação Média
                  </div>
                  <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: regiaoSelecionada.cor }}>
                    {regiaoSelecionada.irradiacao} kWh/m²/dia
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                  A região {regiaoSelecionada.nome} possui uma irradiação média de{' '}
                  <strong style={{ color: 'var(--text-1)' }}>{regiaoSelecionada.irradiacao} kWh/m²/dia</strong>,
                  {regiaoSelecionada.irradiacao >= 5.5
                    ? ' uma das melhores do Brasil para geração solar.'
                    : regiaoSelecionada.irradiacao >= 4.5
                    ? ' com bom potencial para geração de energia solar.'
                    : ' com potencial moderado para geração solar.'}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                Clique em um marcador no mapa para ver detalhes da região.
              </p>
            )}
          </Card>

          {/* Legend */}
          <Card>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>Legenda</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { cor: '#D4A843', label: 'Alta (>5.5 kWh/m²)' },
                { cor: '#F0C96B', label: 'Média-Alta (5.0-5.5)' },
                { cor: '#1FD8A4', label: 'Média (4.5-5.0)' },
                { cor: '#4A9EFF', label: 'Moderada (<4.5)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '3px', background: item.cor, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-2)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
