import path from 'path';
import Message from './message';
import ActorReference from './actor-reference';
import Scheduler from './interfaces/scheduler';
import SimpleScheduler from './simple-scheduler';
import HeimdallLogger from 'heimdalljs-logger';

/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class System {
  scheduler: Scheduler;
  logger: HeimdallLogger;

  constructor() {
    this.scheduler = new SimpleScheduler();
  }

  async schedule(message: Message): Promise<any> {
    return this.scheduler.queue(message);
  }

  actorOf(parameters: { properties: any, actorPath: string }): ActorReference {
    if (parameters.actorPath === '') {
      throw new Error('You must specify a path to an actor.');
    }

    let system = this;
    let requireActorPath = path.join(process.cwd(), parameters.actorPath);

    return new ActorReference({
      actorPath: requireActorPath,
      system
    });
  }

  startTime(): Number {
    return 0;
  }

  uptime(): Number {
    return 0
  };

  stop(actor: ActorReference): void { }

  terminate(): Promise<Boolean> {
    return Promise.resolve(true);
  }

  onTerminate(): void {}
}
