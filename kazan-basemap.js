(() => {
  const attribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  const tileUrl = 'https://vector.openstreetmap.org/shortbread_v1/{z}/{x}/{y}.mvt';
  const land = '#f8f7f3';
  const water = '#dbe7f3';
  const street = '#fffefa';
  const streetEdge = '#dedccd';
  const greenSpaces = new Set(['forest', 'grass', 'meadow', 'park', 'garden', 'nature_reserve', 'recreation_ground']);
  const mainRoads = new Set(['motorway', 'trunk', 'primary', 'secondary']);
  const localStreets = new Set(['tertiary', 'residential', 'unclassified', 'living_street', 'pedestrian']);
  const roadKind = feature => feature.props.kind?.replace(/_link$/, '');
  let renderer;

  window.createKazanBasemap = async () => {
    if (!renderer) {
      renderer = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = './assets/vendor/protomaps/protomaps-leaflet.js';
        script.onload = () => resolve(window.protomapsL);
        script.onerror = () => {
          script.remove();
          reject(new Error('Ресурс карты недоступен'));
        };
        document.head.append(script);
      }).catch(error => {
        renderer = null;
        throw error;
      });
    }

    const {
      leafletLayer, linear, PolygonSymbolizer, LineSymbolizer,
      LineLabelSymbolizer, CenteredTextSymbolizer
    } = await renderer;
    const matches = set => (_zoom, feature) => set.has(feature.props.kind);
    const polygon = (dataLayer, fill, filter) => ({
      dataLayer, filter, symbolizer: new PolygonSymbolizer({fill})
    });
    const mainWidth = linear([[11, 1.1], [14, 3.3], [16, 7], [19, 20]]);
    const localWidth = linear([[11, .65], [14, 1.65], [16, 3.6], [19, 10]]);
    const road = (color, edge = 0) => ({
      dataLayer: 'streets',
      filter: (zoom, feature) => {
        if (feature.props.tunnel) return false;
        const kind = roadKind(feature);
        return mainRoads.has(kind) || localStreets.has(kind) || (kind === 'service' && zoom >= 15);
      },
      symbolizer: new LineSymbolizer({
        color, lineCap: 'round', lineJoin: 'round',
        width: (zoom, feature) => edge + (mainRoads.has(roadKind(feature)) ? mainWidth(zoom) : localWidth(zoom))
      })
    });
    const text = {labelProps: ['name:ru', 'name'], fill: '#64635a', stroke: land, width: 1.6};
    const streetNames = (kinds, minzoom) => ({
      dataLayer: 'street_labels', filter: matches(kinds), minzoom,
      symbolizer: new LineLabelSymbolizer({
        ...text, font: zoom => `${zoom < 16 ? 10 : 11}px Arial, sans-serif`,
        repeatDistance: 240, offset: 1
      })
    });

    return leafletLayer({
      sources: {'': {url: tileUrl, maxDataZoom: 14, levelDiff: 0}},
      attribution, backgroundColor: land, updateWhenIdle: true, noWrap: true,
      paintRules: [
        polygon('land', '#e5efdf', matches(greenSpaces)),
        polygon('ocean', water),
        polygon('water_polygons', water),
        {
          dataLayer: 'water_lines',
          filter: matches(new Set(['river', 'canal', 'stream'])),
          symbolizer: new LineSymbolizer({color: water, width: linear([[11, .7], [17, 2]])})
        },
        polygon('buildings', '#eeede5'),
        polygon('street_polygons', street, matches(new Set(['pedestrian']))),
        road(streetEdge, .9),
        road(street)
      ],
      labelRules: [
        {
          dataLayer: 'place_labels', maxzoom: 13,
          filter: matches(new Set(['city', 'town'])),
          symbolizer: new CenteredTextSymbolizer({...text, font: '12px Arial, sans-serif'})
        },
        streetNames(mainRoads, 12),
        streetNames(localStreets, 14)
      ]
    });
  };
})();
