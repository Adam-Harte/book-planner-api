import { Entity } from 'typeorm';

import { CommonWithImage } from './shared/commonWithImage';

@Entity()
export class Transport extends CommonWithImage {}
