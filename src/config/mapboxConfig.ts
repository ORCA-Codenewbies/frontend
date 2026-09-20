import Config from 'react-native-config';
import Mapbox from '@rnmapbox/maps';

const MAPBOX_ACCESS_TOKEN = Config.MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_ACCESS_TOKEN) {
  console.warn(
    '[Mapbox] MAPBOX_ACCESS_TOKEN is not configured. The map will not load.'
  );
} else {
  Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
}

export { MAPBOX_ACCESS_TOKEN };