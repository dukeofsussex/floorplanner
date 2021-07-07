import Area from './Area';
import Base from './Base';

export default interface Floor extends Base {
    uid: string;
    active: boolean;
    image: string;
    areas: Area[];
}
