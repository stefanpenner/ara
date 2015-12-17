'use strict';

import maxCPU from '../../lib/max-cpu';
import { expect } from 'chai';

describe('maxCPU', ()  => {
  it('is as expected', () => {
    expect(maxCPU).to.be.a.Number;
    expect(maxCPU).to.be.gt(0);
    expect(maxCPU).to.not.be.NaN;
  });
});
