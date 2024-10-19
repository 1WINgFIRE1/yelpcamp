
mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'cluster-map',
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-103.5917, 40.6699],
        zoom: 3
    });


    map.on('load', () => {
        // Add a new source from our GeoJSON data and
        // set the 'cluster' option to true. GL-JS will
        // add the point_count property to your source data.
        map.addSource('campground', {
            type: 'geojson',
            // Point to GeoJSON data. This example visualizes all M1.0+ campground
            // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
            data: campgrounds,
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'campground',
            filter: ['has', 'point_count'],
            paint: {
                // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
                // with three steps to implement three types of circles:
                //   * Blue, 20px circles when point count is less than 100
                //   * Yellow, 30px circles when point count is between 100 and 750
                //   * Pink, 40px circles when point count is greater than or equal to 750
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    'green',
                    10,
                    '#f1f075',
                    20,
                    'red'
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    20,
                    10,
                    30,
                    20,
                    40
                ]
            }
        });

        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'campground',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });

        map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'campground',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': 'white',
                'circle-radius': 5,
                'circle-stroke-width': 1,
                'circle-stroke-color': 'black'
            }
        });

        // inspect a cluster on click
        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            map.getSource('campground').getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;

                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        });

        // When a click event occurs on a feature in
        // the unclustered-point layer, open a popup at
        // the location of the feature, with
        // description HTML from its properties.
        map.on('click', 'unclustered-point', async(e) => {

            const coordinates = e.features[0].geometry.coordinates.slice();
            // const mag = e.features[0].properties.mag;
            // const tsunami =
            //     e.features[0].properties.tsunami === 1 ? 'yes' : 'no';

            // Ensure that if the map is zoomed out such that
            // multiple copies of the feature are visible, the
            // popup appears over the copy being pointed to.
            if (['mercator', 'equirectangular'].includes(map.getProjection().name)) {
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
            }

            var tittle="No Tittle";
            var id;
            await campgrounds.features.find(function(feature) {
                if(e.features[0]._geometry.coordinates[0].toFixed(1) === feature.geometry.coordinates[0].toFixed(1) && 
                    e.features[0]._geometry.coordinates[1].toFixed(1) === feature.geometry.coordinates[1].toFixed(1)){
                    tittle = feature.tittle
                    id=feature._id;
                }
                else{}
            })
            

            new mapboxgl.Popup()
                
                .setLngLat(coordinates)
                .setHTML(
                    `<a href="/campgrounds/${id}"><h4>${tittle}</h4></a>`
                )
                .addTo(map);
        });

        map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = '';
        });
        map.addControl(new mapboxgl.FullscreenControl());

        map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                // When active the map will receive updates to the device's location as it changes.
                trackUserLocation: true,
                // Draw an arrow next to the location dot to indicate which direction the device is heading.
                showUserHeading: true
            })
        );
        map.addControl(new mapboxgl.NavigationControl());
    });



 