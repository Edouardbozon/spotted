import {
  latLng,
  LatLng,
  Layer,
  tileLayer,
  Map,
  MapOptions,
  Point,
  Marker,
  Circle,
  marker,
  icon,
  polyline,
  circle,
  IconOptions,
  Icon,
} from 'leaflet';
import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material';
import { WINDOW } from 'src/app/core/window.service';
import {
  distinctUntilChanged,
  debounceTime,
  switchMap,
  catchError,
  filter,
  tap,
} from 'rxjs/internal/operators';
import { SpotsService } from '../../spots.service';

@Component({
  selector: 'spt-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  /**
   * Map ref
   */
  map: Map;

  /**
   * Animation duration when flying to a point (in s)
   */
  mapMoveDuration = 1;

  /**
   * Display the map menu with right X position
   */
  mouseX: number;

  /**
   * Display the map menu with right Y position
   */
  mouseY: number;

  /**
   * Menu displayed on the map when clicking
   */
  @ViewChild(MatMenuTrigger) matMenu: MatMenuTrigger;

  /**
   * Emit the Lat & Lng to create a Spot at the click position
   */
  @Output() spotAdded: EventEmitter<LatLng> = new EventEmitter<LatLng>();

  /**
   * The last Point to emit
   */
  point: Point;

  /**
   * Map zoom
   */
  zoom = 13;

  /**
   * Max zoom that can be reached
   */
  maxZoom = 20;

  /**
   * Latitude
   */
  lat = 46.879966;

  /**
   * Longitude
   */
  lng = -121.726909;

  /**
   * Map layers
   */
  layers: Layer[] = [];

  /**
   * Gmap tile Layer
   */
  googleMaps: Layer = tileLayer(
    'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      detectRetina: true,
    }
  );

  /**
   * Gmap street tile Layer
   */
  googleHybrid: Layer = tileLayer(
    'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      detectRetina: true,
    }
  );

  /**
   * Icon config for markers
   */
  iconConfig: Icon<IconOptions> = icon({
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png',
  });

  /**
   * Layers control object with our two base layers and the three overlay layers
   */
  layersControl = {
    baseLayers: {
      'Google Maps': this.googleMaps,
      'Google Street': this.googleHybrid,
    },
    overlays: {},
  };

  /**
   * Map options
   */
  options: MapOptions = {
    layers: [this.googleMaps],
    zoom: this.zoom,
    center: this.center,
    tap: true,
    zoomControl: false,
  };

  /**
   * Lat & Long computed user to center Leaflet map
   */
  get center(): LatLng {
    return latLng(this.lat, this.lng);
  }

  constructor(
    @Inject(WINDOW) private window: Window,
    private spotsService: SpotsService
  ) {}

  ngOnInit() {
    this.tryBrowserGeoLocalization();
  }

  onMapReady(map: Map): void {
    this.map = map;

    // bind spots to marker creation on the map
    this.spotsService.spots
      .pipe(
        tap(spots => {
          spots.forEach(spot => {
            const latitudeLongitude = new LatLng(
              spot.location.latitude,
              spot.location.longitude
            );
            this.addMarker(latitudeLongitude);
          });
        })
      )
      .subscribe();
  }

  onMapClick(event: MouseEvent): void {
    event.preventDefault();

    if (event instanceof MouseEvent) {
      this.mouseY = event.offsetY;
      this.mouseX = event.offsetX;
      this.point = new Point(this.mouseX, this.mouseY);
      this.matMenu.openMenu();
    }
  }

  addSpot(): void {
    const latitudeLongitude = this.map.containerPointToLatLng(this.point);
    this.spotAdded.emit(latitudeLongitude);
    this.map.flyTo(latitudeLongitude);
  }

  private addMarker(latitudeLongitude?: LatLng): void {
    this.map.addLayer(
      marker(latitudeLongitude || this.map.containerPointToLatLng(this.point), {
        icon: this.iconConfig,
      })
    );
  }

  private tryBrowserGeoLocalization(): void {
    const { navigator } = this.window;

    // Try HTML5 geolocation.
    if (navigator && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          this.setPosition(latitude, longitude);
        },
        () => {
          // @todo center map, handle error
        }
      );
    } else {
      // Browser doesn't support Geolocation
      // @todo center map, handle error
    }
  }

  private setPosition(latitude: number, longitude: number): void {
    this.lat = latitude;
    this.lng = longitude;

    this.map.flyTo(new LatLng(this.lat, this.lng), this.zoom, {
      duration: this.mapMoveDuration,
    });
  }
}