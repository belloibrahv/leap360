import { Ward } from '@/core/types/ward';
import { SchoolClass } from '@/core/types/class';

export interface SchoolDetails {
  id: string;
  name: string;
  wards: Ward[];
  managedClasses: SchoolClass[];
}
