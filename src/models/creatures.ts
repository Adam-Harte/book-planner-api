import { Entity } from 'typeorm';

import { Being } from './shared/being';

@Entity()
export class Creatures extends Being {}
