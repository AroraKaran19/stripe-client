import type { Transaction } from "./transaction";

export interface MenuLink {
  name: string;
  icon?: React.ReactNode;
  href?: string;
  subMenu?: MenuLink[];
}

export type { Transaction };
