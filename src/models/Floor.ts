import Area from './Area';
import Base from './Base';

export default interface Floor extends Base {
    uid: String;
    active: Boolean;
    image: String;
    areas: Area[];
}
