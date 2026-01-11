export type EntityFilter = {
  type?: string;
  [key: string]: any;
};

export type EntityView = {
  entityType: string;
  filter?: EntityFilter;
};
