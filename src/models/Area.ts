import Base from './Base';
import Point from './Point';

export default interface Area extends Base {
    hoverDescription: String;
    points: Point[];
}
