import { createWorkflowEntity, wkAction } from '../src';

const sleep = (delay: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, delay));

describe('workflow entity', () => {
  it('should call action handler', async () => {
    const fn = jest.fn(
      wkAction(() => {
        //
      })
    );
    const { state, internalActions, ...entity } = createWorkflowEntity(
      {},
      {
        actions: {
          act: fn,
        },
      }
    );
    await entity.actions.act(null, { promise: true });
    expect(fn).toBeCalled();
  });

  it('should call action handler with arg', async () => {
    const arg = {};
    const fn = jest.fn(
      wkAction<typeof arg>((a) => {
        expect(a).toBe(arg);
      })
    );
    const { state, internalActions, ...entity } = createWorkflowEntity(
      {},
      {
        actions: {
          act: fn,
        },
      }
    );
    await entity.actions.act(arg, { promise: true });
    expect(fn).toBeCalled();
  });

  it('should mark entity as not ongoing before resolving', async () => {
    const { state, internalActions, ...entity } = createWorkflowEntity(
      {},
      {
        actions: {
          act: async () => {
            await sleep(10);
          },
        },
      }
    );

    await entity.actions.act(null, { promise: true });
    expect(entity.actionQueueSize).toBe(0);
    expect(entity.isActionOngoing).toBe(false);
    expect(entity.ongoingAction).toBe(null);
  });

  describe('trx api', () => {
    it('should wait', async () => {
      let DONE = false;
      const fn = jest.fn(
        wkAction(async (a, api) => {
          await api.wait(10);
          DONE = true;
        })
      );
      const { state, internalActions, ...entity } = createWorkflowEntity(
        {},
        {
          actions: {
            act: fn,
          },
        }
      );
      entity.actions.act();
      expect(DONE).toBe(false);
      await sleep(0);
      expect(DONE).toBe(false);
      expect(fn).toHaveBeenCalled();
      await sleep(10);
      expect(DONE).toBe(true);
    });
  });

  it('should propagate error on await promise', async () => {
    const entity = createWorkflowEntity(
      {},
      {
        actions: {
          act: async () => {
            await sleep(50);
            throw new Error('err');
          },
        },
      }
    );
    expect(() => entity.actions.act(null, { promise: true })).rejects.toThrow(
      'err'
    );
  });

  // it.only('should propagate error on await promise', async () => {
  //   const entity = createWorkflowEntity(
  //     {},
  //     {
  //       actions: {
  //         act: async () => {
  //           await sleep(50);
  //           throw new Error('err');
  //         },
  //       },
  //     }
  //   );
  //   entity.actions.act(null);
  //   await sleep(100);
  // });
});
