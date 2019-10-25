import Base from './Base';
import Floor from './Floor';

export default interface Floorplan extends Base {
    floors: Floor[];
}
