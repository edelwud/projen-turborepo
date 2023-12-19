import { Task } from "projen";
import { TaskStepOptions } from "projen/lib/task-model";

export class CommandUtils {
  public static overrideDefaultCommand(
    task?: Task,
    command?: string,
    options?: TaskStepOptions,
  ) {
    // @ts-ignore
    task?._locked = false;
    task?.reset(command, options);
    // @ts-ignore
    task?._locked = true;
  }
  public static prependDefaultCommand(
    task: Task,
    prependedTask: Task,
    options?: TaskStepOptions,
  ) {
    // @ts-ignore
    task?._locked = false;
    task?.prependSpawn(prependedTask, options);
    // @ts-ignore
    task?._locked = true;
  }
}
