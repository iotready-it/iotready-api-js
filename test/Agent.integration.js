/**
 * Tests for real the Agent class using an external service.
 */

import { expect } from './test-setup';
import Agent from '../src/Agent';


describe('Agent', () => {
	if (!process.env.SKIP_AGENT_TEST){
		it('can fetch a webpage', () => {
			const sut = new Agent();
			const args = { a: '1', b: '2' };
			const result = sut.get('http://httpbin.org/get', undefined, args);
			return result.then((r)=> {
				expect(r.statusCode).to.equal(200);
				expect(r).has.property('body');
				expect(r.body.args).to.deep.equal(args);
			});
		});
	}
});
