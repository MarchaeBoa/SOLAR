import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Search, Layers, Filter, Satellite, Map as MapIcon, Navigation } from 'lucide-react';
import Card from '../components/Card';

import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom gold marker for solar regions
const solarIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const regioes = [
  { nome: 'Norte', irradiacao: 5.5, cor: '#F0C96B', lat: -3.1, lng: -60.0 },
  { nome: 'Nordeste', irradiacao: 5.8, cor: '#D4A843', lat: -8.0, lng: -37.0 },
  { nome: 'Centro-Oeste', irradiacao: 5.4, cor: '#F0C96B', lat: -15.6, lng: -49.5 },
  { nome: 'Sudeste', irradiacao: 4.8, cor: '#1FD8A4', lat: -20.5, lng: -44.0 },
  { nome: 'Sul', irradiacao: 4.3, cor: '#4A9EFF', lat: -27.5, lng: -50.5 },
];

const camadas = [
  { id: 'irradiacao', label: 'Irradiação Solar', ativo: true },
  { id: 'temperatura', label: 'Temperatura', ativo: false },
  { id: 'nebulosidade', label: 'Nebulosidade', ativo: false },
  { id: 'topografia', label: 'Topografia', ativo: false },
];

const TILES = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Earthstar Geographics',
  },
};

// Component to handle map movements from parent
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Component to expose map ref
function MapEvents({ onMapReady }) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

export default function MapaSolar() {
  const [regiaoSelecionada, setRegiaoSelecionada] = useState(null);
  const [camadaAtiva, setCamadaAtiva] = useState(camadas);
  const [tileMode, setTileMode] = useState('street');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchMarker, setSearchMarker] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [flyTo, setFlyTo] = useState(null);
  const [flyZoom, setFlyZoom] = useState(null);
  const mapRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const BRASIL_CENTER = [-14.235, -51.925];
  const INITIAL_ZOOM = 4;

  const handleMapReady = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const toggleCamada = (id) => {
    setCamadaAtiva(prev =>
      prev.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c)
    );
  };

  // Geocoding search using Nominatim (free, no API key)
  const searchAddress = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5`,
        { headers: { 'Accept-Language': 'pt-BR' } }
      );
      const data = await response.json();
      setSearchResults(data.map(item => ({
        display: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      })));
    } catch (err) {
      console.error('Erro na busca:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchAddress(value), 400);
  };

  const handleSelectResult = (result) => {
    setSearchMarker({ lat: result.lat, lng: result.lng, label: result.display });
    setFlyTo([result.lat, result.lng]);
    setFlyZoom(15);
    setSearchResults([]);
    setSearchQuery(result.display.split(',')[0]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectResult(searchResults[0]);
    } else {
      searchAddress(searchQuery);
    }
  };

  const goToRegion = (regiao) => {
    setRegiaoSelecionada(regiao);
    setFlyTo([regiao.lat, regiao.lng]);
    setFlyZoom(6);
  };

  const resetView = () => {
    setFlyTo(BRASIL_CENTER);
    setFlyZoom(INITIAL_ZOOM);
    setSearchMarker(null);
    setRegiaoSelecionada(null);
  };

  const getIrradiacaoColor = (irradiacao) => {
    if (irradiacao >= 5.5) return '#D4A843';
    if (irradiacao >= 5.0) return '#F0C96B';
    if (irradiacao >= 4.5) return '#1FD8A4';
    return '#4A9EFF';
  };

  return (
    <div>
      <div className="page-header">
        <h1>Mapa Solar</h1>
        <p>Visualize a irradiação solar em todo o território brasileiro</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Map area */}
        <Card style={{ position: 'relative', minHeight: '520px', overflow: 'hidden', padding: 0 }}>
          {/* Search bar overlay */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '80px',
            zIndex: 1000,
          }}>
            <form onSubmit={handleSearchSubmit} style={{
              display: 'flex',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              borderRadius: 'var(--r-sm)',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="Buscar endereço ou cidade..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-1)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <button type="submit" style={{
                padding: '10px 14px',
                background: 'var(--gold-dim)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--gold)',
              }}>
                <Search size={16} />
              </button>
            </form>

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div style={{
                marginTop: '4px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                borderRadius: 'var(--r-sm)',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                maxHeight: '240px',
                overflowY: 'auto',
              }}>
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectResult(r)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 14px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: i < searchResults.length - 1 ? '1px solid var(--border)' : 'none',
                      color: 'var(--text-2)',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    {r.display}
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <div style={{
                marginTop: '4px',
                padding: '10px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                borderRadius: 'var(--r-sm)',
                color: 'var(--text-3)',
                fontSize: '0.8rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}>
                Buscando...
              </div>
            )}
          </div>

          {/* Map controls overlay */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 1000,
          }}>
            <button
              onClick={() => setTileMode(tileMode === 'street' ? 'satellite' : 'street')}
              title={tileMode === 'street' ? 'Modo Satélite' : 'Modo Mapa'}
              style={{
                width: 36,
                height: 36,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                borderRadius: 'var(--r-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: tileMode === 'satellite' ? 'var(--gold)' : 'var(--text-2)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {tileMode === 'street' ? <Satellite size={16} /> : <MapIcon size={16} />}
            </button>
            <button
              onClick={resetView}
              title="Voltar ao Brasil"
              style={{
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
              }}
            >
              <Navigation size={16} />
            </button>
          </div>

          {/* Leaflet Map */}
          <MapContainer
            center={BRASIL_CENTER}
            zoom={INITIAL_ZOOM}
            style={{ height: '520px', width: '100%', borderRadius: 'var(--r)' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              key={tileMode}
              url={TILES[tileMode].url}
              attribution={TILES[tileMode].attribution}
            />

            <MapController center={flyTo} zoom={flyZoom} />
            <MapEvents onMapReady={handleMapReady} />

            {/* Region circles for irradiance overlay */}
            {camadaAtiva.find(c => c.id === 'irradiacao')?.ativo &&
              regioes.map((r, i) => (
                <Circle
                  key={i}
                  center={[r.lat, r.lng]}
                  radius={300000}
                  pathOptions={{
                    color: r.cor,
                    fillColor: r.cor,
                    fillOpacity: 0.15,
                    weight: 2,
                    opacity: 0.6,
                  }}
                  eventHandlers={{
                    click: () => goToRegion(r),
                  }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'Outfit, sans-serif', minWidth: '160px' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{r.nome}</strong>
                      <br />
                      <span style={{ color: r.cor, fontWeight: 700, fontSize: '1.1rem' }}>
                        {r.irradiacao} kWh/m²/dia
                      </span>
                    </div>
                  </Popup>
                </Circle>
              ))
            }

            {/* Search result marker */}
            {searchMarker && (
              <Marker position={[searchMarker.lat, searchMarker.lng]} icon={solarIcon}>
                <Popup>
                  <div style={{ fontFamily: 'Outfit, sans-serif', maxWidth: '240px' }}>
                    <strong style={{ fontSize: '0.85rem' }}>{searchMarker.label}</strong>
                    <br />
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>
                      {searchMarker.lat.toFixed(5)}, {searchMarker.lng.toFixed(5)}
                    </span>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Info bar */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            display: 'flex',
            gap: '16px',
            fontSize: '0.7rem',
            color: 'var(--text-3)',
            background: 'rgba(4,9,15,0.8)',
            padding: '6px 12px',
            borderRadius: 'var(--r-sm)',
            zIndex: 1000,
          }}>
            <span>Irradiação: kWh/m²/dia</span>
            <span>Fonte: INPE/Atlas Solar</span>
            {searchMarker && (
              <span style={{ color: 'var(--gold)' }}>
                📍 {searchMarker.lat.toFixed(4)}, {searchMarker.lng.toFixed(4)}
              </span>
            )}
          </div>
        </Card>

        {/* Sidebar panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Layers */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Layers size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Camadas</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {camadaAtiva.map((c) => (
                <label key={c.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: c.ativo ? 'var(--bg-elevated)' : 'transparent',
                  borderRadius: 'var(--r-sm)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all var(--t)',
                }}>
                  <input
                    type="checkbox"
                    checked={c.ativo}
                    onChange={() => toggleCamada(c.id)}
                    style={{ accentColor: 'var(--gold)' }}
                  />
                  {c.label}
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
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Coordenadas
                  </div>
                  <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                    {regiaoSelecionada.lat.toFixed(4)}, {regiaoSelecionada.lng.toFixed(4)}
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
                Clique em uma região no mapa ou busque um endereço para ver detalhes.
              </p>
            )}
          </Card>

          {/* Search result info */}
          {searchMarker && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Search size={18} color="var(--green)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Local Selecionado</h3>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6, wordBreak: 'break-word' }}>
                {searchMarker.label}
              </div>
              <div className="mono" style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--r-sm)',
                fontSize: '0.78rem',
                color: 'var(--green)',
              }}>
                Lat: {searchMarker.lat.toFixed(6)}<br />
                Lng: {searchMarker.lng.toFixed(6)}
              </div>
            </Card>
          )}

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
