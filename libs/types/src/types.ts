export type ServiceSpec = {
  path?: string;
  env?: Record<string, string>;
  cmd: string[];
};

export type StackSpec = {
  services: Record<string, ServiceSpec>;
};

export type MetroSpec = {
  stacks: Record<string, StackSpec>;
};

export type ServiceInfo = {
  /**
   * service key
   */
  key: string;
  /**
   * stack name
   */
  stack: string;
  /**
   * service spec
   */
  spec: ServiceSpec;
};

export type ServiceStateEnum =
  | 'off'
  | 'pending-assignment'
  | 'assigned'
  | 'running';
export type ServiceState = {
  name: string;
  state: ServiceStateEnum;
  assignedRunnerId?: string;

  current_task_id?: string;
  current_task_state?:
    | 'noop'
    | 'creating'
    | 'running'
    | 'stopping'
    | 'stopped'
    | 'exited';
};

export type Task = {
  id: string;
  service_name: string;
  service_spec: ServiceSpec;
  runner_id: string;
  creating_at: Date;
  updated_at: Date;
  running_at: Date;
  stopping_at: Date;
  stopped_at: Date;
  exited_at: Date;
  exit_code: number;
};
