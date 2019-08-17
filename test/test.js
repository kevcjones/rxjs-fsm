'use strict';
var expect = require('chai').expect;
var RxFsm = require('../dist/index.js');

describe('RxFsm', () => {
  it('construct fine', () => {
    var result = index.getPlural('Boy');
    expect(result).to.equal('Boys');
  });
  it('should return Girls', () => {
    var result = index.getPlural('Girl');
    expect(result).to.equal('Girls');
  });
  it('should return Geese', () => {
    var result = index.getPlural('Goose');
    expect(result).to.equal('Geese');
  });
  it('should return Toys', () => {
    var result = index.getPlural('Toy');
    expect(result).to.equal('Toys');
  });
  it('should return Men', () => {
    var result = index.getPlural('Man');
    expect(result).to.equal('Men');
  });
});
